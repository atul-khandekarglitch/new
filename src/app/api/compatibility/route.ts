import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { evaluateCompatibility } from "@/lib/compatibility";

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();

    let listing = body.listingId ? db.listings.find((l) => l.id === body.listingId) : body.listing;
    let requirement = body.requirementId
      ? db.buyerRequirements.find((r) => r.id === body.requirementId)
      : body.requirement;

    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found or provided" }, { status: 400 });
    }

    if (!requirement) {
      // Create a default requirement based on listing if none provided
      requirement = {
        id: "req_adhoc",
        buyerCompanyId: "comp_kalyani_fab",
        buyerUserId: "user_buyer_rajesh",
        title: "Ad-hoc Comparison Specification",
        materialCategory: listing.materialCategory,
        requiredGrade: body.requiredGrade || listing.grade,
        quantityRequired: body.quantityRequired ? Number(body.quantityRequired) : listing.minOrderQuantity,
        quantityUnit: listing.quantityUnit,
        maxBudgetPerUnit: listing.pricePerUnit * 1.1,
        currency: listing.currency,
        conditionAcceptable: body.conditionAcceptable || ["clean"],
        requiredCertifications: body.requiredCertifications || ["Mill Test Report (MTR)"],
        destinationCity: body.destinationCity || "Pune",
        destinationState: body.destinationState || "Maharashtra",
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        isPrivate: false,
        status: "active",
        createdAt: new Date().toISOString(),
      };
    }

    const evaluation = evaluateCompatibility(listing, requirement);

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      requirementId: requirement.id,
      evaluation,
    });
  } catch (error) {
    console.error("POST /api/compatibility error:", error);
    return NextResponse.json({ success: false, error: "Compatibility check failed" }, { status: 500 });
  }
}
