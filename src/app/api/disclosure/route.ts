import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { DisclosureRequest } from "@/types";
import { notifyDisclosureRequestCreated, notifyDisclosureRequestStatusChanged } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    let requests = db.disclosureRequests;
    if (companyId) {
      requests = requests.filter(
        (r) => r.requesterCompanyId === companyId || r.targetCompanyId === companyId
      );
    }

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("GET /api/disclosure error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch disclosures" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();

    const newRequest: DisclosureRequest = {
      id: `req_disc_${Date.now()}`,
      requesterCompanyId: body.requesterCompanyId || "comp_kalyani_fab",
      requesterCompanyName: body.requesterCompanyName || "Kalyani Industrial Equipment",
      targetCompanyId: body.targetCompanyId,
      targetCompanyName: body.targetCompanyName || "Protected Industrial Supplier",
      listingId: body.listingId,
      listingTitle: body.listingTitle || "Material Listing",
      requestType: body.requestType || "contact_info",
      documentTitle: body.documentTitle,
      status: "pending",
      justification: body.justification || "Commercial inquiry for certified material purchase.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.disclosureRequests.unshift(newRequest);
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: body.requesterUserId || "user_buyer_rajesh",
      action: "DISCLOSURE_REQUESTED",
      details: `Requested ${newRequest.requestType} for listing ${newRequest.listingTitle}`,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(db);

    // Automatic notification to Target Supplier (non-blocking)
    notifyDisclosureRequestCreated(newRequest).catch((e) => console.warn("Disclosure request email notice:", e));

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("POST /api/disclosure error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit disclosure request" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { id, status } = body;

    const index = db.disclosureRequests.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    db.disclosureRequests[index].status = status;
    db.disclosureRequests[index].updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: "sys_approval",
      action: `DISCLOSURE_${status.toUpperCase()}`,
      details: `Disclosure request ${id} status updated to ${status}`,
      timestamp: new Date().toISOString(),
    });

    saveDatabase(db);

    // Automatic notification to Requester on status change (non-blocking)
    notifyDisclosureRequestStatusChanged(db.disclosureRequests[index], status).catch((e) => console.warn("Disclosure status email notice:", e));

    return NextResponse.json({ success: true, request: db.disclosureRequests[index] });
  } catch (error) {
    console.error("PUT /api/disclosure error:", error);
    return NextResponse.json({ success: false, error: "Failed to update disclosure request" }, { status: 500 });
  }
}
