import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { Invoice, Payment } from "@/types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const orderId = params.id;

    const order = (db.orders || []).find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const invoice = (db.invoices || []).find((i) => i.orderId === orderId || i.id === order.invoiceId);
    const payment = (db.payments || []).find((p) => p.orderId === orderId || p.id === order.paymentId);

    return NextResponse.json({
      success: true,
      order,
      invoice,
      payment,
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const orderId = params.id;
    const body = await req.json();

    const orderIndex = (db.orders || []).findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = db.orders[orderIndex];

    // Prevent duplicate payment processing & duplicate invoice generation (Section 3 Rule)
    if (order.status === "paid") {
      const existingInvoice = (db.invoices || []).find((i) => i.orderId === orderId);
      return NextResponse.json({
        success: true,
        message: "Order already paid and verified",
        order,
        invoice: existingInvoice,
      });
    }

    const provider = body.provider || "demo_gateway";
    const paymentReference = body.paymentReference || `PAY-INDUS-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const invoiceDate = now.split("T")[0];

    // Server-side payment record
    const paymentId = `pay_${Date.now()}`;
    const newPayment: Payment = {
      id: paymentId,
      orderId: order.id,
      provider: provider as any,
      providerPaymentReference: paymentReference,
      amount: order.totalAmount,
      currency: order.currency,
      status: "confirmed",
      isTestMode: true,
      confirmedAt: now,
      createdAt: now,
    };

    if (!db.payments) db.payments = [];
    db.payments.unshift(newPayment);

    // Generate unique sequential invoice number: INV-2026-XXXX
    const invoiceCount = (db.invoices || []).length + 1001;
    const invoiceNumber = `INV-2026-${invoiceCount}`;
    const invoiceId = `inv_${Date.now()}`;

    const listing = db.listings.find((l) => l.id === order.listingId);
    const supplierCompany = db.companies.find((c) => c.id === listing?.supplierCompanyId);

    const newInvoice: Invoice = {
      id: invoiceId,
      orderId: order.id,
      invoiceNumber,
      invoiceDate,
      sellerDetails: {
        companyName: supplierCompany?.name || order.sellerCompanyName,
        city: order.sellerCity,
        state: order.sellerState,
        country: "India",
        industrialArea: listing?.industrialArea,
        email: order.sellerEmail,
        phone: supplierCompany?.contactPhone || "+91 80 2839 4401",
      },
      buyerDetails: {
        fullName: order.buyerName,
        companyName: order.buyerCompanyName,
        email: order.buyerEmail,
        phone: order.buyerPhone,
        city: "Pune",
        state: "Maharashtra",
      },
      materialDetails: {
        listingId: order.listingId,
        materialName: order.items[0]?.materialName || listing?.materialName || "Industrial By-Product",
        grade: order.items[0]?.grade || listing?.grade || "Declared Commercial",
        category: order.items[0]?.materialCategory || listing?.materialCategory || "Alloy",
        quantity: order.items[0]?.quantity || 1,
        unit: order.items[0]?.unit || "kg",
        unitPrice: order.items[0]?.unitPrice || 0,
      },
      subtotal: order.subtotal,
      transportCost: order.transportCost,
      processingCost: order.processingCost,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentStatus: "paid",
      paymentReference,
      paymentMethod: "Industrial Verified Escrow (Test Mode)",
      storagePath: `/invoices/${invoiceNumber}.pdf`,
      createdAt: now,
    };

    if (!db.invoices) db.invoices = [];
    db.invoices.unshift(newInvoice);

    // Update order status and link invoice & payment
    order.status = "paid";
    order.invoiceId = invoiceId;
    order.paymentId = paymentId;
    order.updatedAt = now;
    db.orders[orderIndex] = order;

    // Deduct purchased quantity from listing inventory
    if (listing) {
      const purchasedQty = order.items[0]?.quantity || 0;
      listing.totalQuantity = Math.max(0, listing.totalQuantity - purchasedQty);
      if (listing.totalQuantity === 0) {
        listing.status = "sold";
      }
    }

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: order.buyerId,
      action: "PAYMENT_CONFIRMED",
      details: `Payment confirmed for order ${order.id}. Generated invoice ${invoiceNumber} for ₹${order.totalAmount}.`,
      timestamp: now,
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and invoice generated",
      order,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("POST /api/orders/[id] error:", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}
