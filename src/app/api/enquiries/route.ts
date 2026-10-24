import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { EnquiryOffer } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    let items = db.enquiries;
    if (companyId) {
      items = items.filter(e => e.buyerCompanyId === companyId || e.sellerCompanyId === companyId);
    }

    return NextResponse.json({ success: true, enquiries: items });
  } catch (error) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();

    const newEnquiry: EnquiryOffer = {
      id: `enq_${Date.now()}`,
      listingId: body.listingId,
      listingTitle: body.listingTitle || "Material Listing",
      buyerCompanyId: body.buyerCompanyId || "comp_kalyani_fab",
      buyerCompanyName: body.buyerCompanyName || "Kalyani Industrial Equipment",
      sellerCompanyId: body.sellerCompanyId || "comp_apex_aero",
      sellerCompanyName: body.sellerCompanyName || "Industrial Supplier",
      type: body.type || "enquiry",
      offeredPrice: Number(body.offeredPrice) || 0,
      quantity: Number(body.quantity) || 1,
      message: body.message || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    db.enquiries.unshift(newEnquiry);
    
    // Also bump enquiry count on listing
    const listing = db.listings.find(l => l.id === body.listingId);
    if (listing) {
      listing.enquiriesCount += 1;
    }

    saveDatabase(db);

    return NextResponse.json({ success: true, enquiry: newEnquiry });
  } catch (error) {
    console.error("POST /api/enquiries error:", error);
    return NextResponse.json({ success: false, error: "Failed to send enquiry" }, { status: 500 });
  }
}
