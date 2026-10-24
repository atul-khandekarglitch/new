import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { evaluateCompatibility } from "@/lib/compatibility";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const listingId = params.id;

    const listing = db.listings.find((l) => l.id === listingId);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    // Increment views count
    listing.viewsCount += 1;
    saveDatabase(db);

    const supplierCompany = db.companies.find((c) => c.id === listing.supplierCompanyId);
    
    // Check if disclosure request has been approved for caller
    const isCompanyPrivate = supplierCompany?.privacyLevel !== "public";

    // Run compatibility checks against available active buyer requirements
    const compatibilityMatches = db.buyerRequirements.map((req) => {
      const evaluation = evaluateCompatibility(listing, req);
      return {
        requirementId: req.id,
        requirementTitle: req.title,
        buyerCity: req.destinationCity,
        evaluation,
      };
    });

    return NextResponse.json({
      success: true,
      listing,
      supplierCompany: {
        id: supplierCompany?.id,
        name: isCompanyPrivate ? `${supplierCompany?.industry} (${listing.city} Hub)` : supplierCompany?.name,
        isPrivate: isCompanyPrivate,
        industry: supplierCompany?.industry,
        manufacturingProcess: supplierCompany?.manufacturingProcess,
        city: listing.city,
        state: listing.state,
        country: listing.country,
        industrialArea: listing.industrialArea,
        capabilities: supplierCompany?.capabilities || [],
        verified: supplierCompany?.verified || false,
      },
      compatibilityMatches,
    });
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const listingId = params.id;
    const body = await req.json();

    const index = db.listings.findIndex((l) => l.id === listingId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    const existing = db.listings[index];
    const updated = {
      ...existing,
      ...body,
      id: existing.id, // prevent overwriting ID
      updatedAt: new Date().toISOString(),
    };

    db.listings[index] = updated;
    saveDatabase(db);

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("PUT /api/listings/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const listingId = params.id;

    const index = db.listings.findIndex((l) => l.id === listingId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    db.listings[index].status = "archived";
    saveDatabase(db);

    return NextResponse.json({ success: true, message: "Listing archived successfully" });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to archive listing" }, { status: 500 });
  }
}
