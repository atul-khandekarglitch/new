import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { SupplierInvoice, PaymentTransaction } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const invoices: SupplierInvoice[] = db.supplierInvoices || [];

    // Financial KPI Summary (Single Source of Truth)
    const totalPayable = invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingPayment = invoices
      .filter((inv) => inv.paymentStatus === "Pending Payment")
      .reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const overduePayment = invoices
      .filter((inv) => inv.paymentStatus === "Overdue")
      .reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const pendingApproval = invoices
      .filter((inv) => ["Draft", "Pending Review", "Under Review"].includes(inv.approvalStatus))
      .reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    
    // Upcoming cash obligations (due within 14 days)
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingCashObligations = invoices
      .filter((inv) => {
        if (inv.paymentStatus === "Paid") return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate >= now && dueDate <= in14Days;
      })
      .reduce((sum, inv) => sum + inv.outstandingBalance, 0);

    return NextResponse.json({
      success: true,
      invoices,
      summary: {
        totalPayable,
        totalPaid,
        pendingPayment,
        overduePayment,
        pendingApproval,
        upcomingCashObligations,
      },
    });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve supplier payments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { action, invoiceId, rejectionReason, clarificationQuery, amount, paymentMethod, processedBy } = body;

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
    }

    const index = db.supplierInvoices.findIndex((inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const invoice = db.supplierInvoices[index];
    const nowIso = new Date().toISOString();

    if (action === "approve") {
      invoice.approvalStatus = "Approved";
      if (invoice.paymentStatus === "Not Due" || invoice.paymentStatus === "Pending Payment") {
        invoice.paymentStatus = "Pending Payment";
      }
      if (invoice.threeWayMatch.matched) {
        invoice.eligibilityStatus = "Eligible";
        invoice.eligibilityReason = "Invoice approved by finance; 3-way match verified against GRN.";
      }
      invoice.updatedAt = nowIso;
      
      db.auditLogs.push({
        id: `log_${Date.now()}`,
        userId: processedBy || "user_buyer_rajesh",
        action: "INVOICE_APPROVED",
        details: `Approved supplier invoice ${invoice.invoiceNumber} for ₹${invoice.invoiceAmount.toLocaleString("en-IN")}`,
        timestamp: nowIso,
      });

    } else if (action === "reject") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json({ success: false, error: "Rejection reason is mandatory" }, { status: 400 });
      }
      invoice.approvalStatus = "Rejected";
      invoice.eligibilityStatus = "Blocked";
      invoice.rejectionReason = rejectionReason.trim();
      invoice.eligibilityReason = `Rejected: ${rejectionReason.trim()}`;
      invoice.updatedAt = nowIso;

      db.auditLogs.push({
        id: `log_${Date.now()}`,
        userId: processedBy || "user_buyer_rajesh",
        action: "INVOICE_REJECTED",
        details: `Rejected supplier invoice ${invoice.invoiceNumber}. Reason: ${rejectionReason}`,
        timestamp: nowIso,
      });

    } else if (action === "clarification") {
      if (!clarificationQuery || !clarificationQuery.trim()) {
        return NextResponse.json({ success: false, error: "Clarification query is mandatory" }, { status: 400 });
      }
      invoice.approvalStatus = "Needs Clarification";
      invoice.eligibilityStatus = "Needs review";
      invoice.clarificationQuery = clarificationQuery.trim();
      invoice.eligibilityReason = `Needs clarification: ${clarificationQuery.trim()}`;
      invoice.updatedAt = nowIso;

      db.auditLogs.push({
        id: `log_${Date.now()}`,
        userId: processedBy || "user_buyer_rajesh",
        action: "CLARIFICATION_REQUESTED",
        details: `Requested clarification on ${invoice.invoiceNumber}: ${clarificationQuery}`,
        timestamp: nowIso,
      });

    } else if (action === "pay") {
      const payAmount = typeof amount === "number" && amount > 0 ? amount : invoice.outstandingBalance;
      if (payAmount <= 0) {
        return NextResponse.json({ success: false, error: "No outstanding balance to pay" }, { status: 400 });
      }

      const txnRef = `DEMO-TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTransaction: PaymentTransaction = {
        id: `txn_${Date.now()}`,
        invoiceId: invoice.id,
        transactionReference: txnRef,
        amount: payAmount,
        paymentDate: nowIso,
        paymentMethod: paymentMethod || "Industrial Verified Escrow (Demo Mode)",
        processedBy: processedBy || "Rajesh Sharma (Head of Procurement)",
        note: `Demo payment released against invoice ${invoice.invoiceNumber}`,
        status: "success",
      };

      invoice.transactions.push(newTransaction);
      invoice.paidAmount += payAmount;
      invoice.outstandingBalance = Math.max(0, invoice.invoiceAmount - invoice.paidAmount);

      if (invoice.outstandingBalance === 0) {
        invoice.paymentStatus = "Paid";
        invoice.approvalStatus = "Approved";
        invoice.eligibilityStatus = "Eligible";
        invoice.eligibilityReason = "Fully paid and verified.";
        // Mark all milestones as paid
        invoice.milestones = invoice.milestones.map((m) => ({
          ...m,
          status: "paid",
          verifiedAt: m.verifiedAt || nowIso,
        }));
      } else {
        invoice.paymentStatus = "Partially Paid";
      }

      invoice.updatedAt = nowIso;

      db.auditLogs.push({
        id: `log_${Date.now()}`,
        userId: processedBy || "user_buyer_rajesh",
        action: "PAYMENT_PROCESSED",
        details: `Released payment ₹${payAmount.toLocaleString("en-IN")} for ${invoice.invoiceNumber}. Ref: ${txnRef}`,
        timestamp: nowIso,
      });

      db.supplierInvoices[index] = invoice;
      saveDatabase(db);

      return NextResponse.json({
        success: true,
        invoice,
        transaction: newTransaction,
        message: `Successfully processed demo payment ₹${payAmount.toLocaleString("en-IN")} (Ref: ${txnRef})`,
      });

    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    db.supplierInvoices[index] = invoice;
    saveDatabase(db);

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ success: false, error: "Failed to update supplier invoice" }, { status: 500 });
  }
}
