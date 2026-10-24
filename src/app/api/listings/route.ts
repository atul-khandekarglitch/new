import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { MaterialListing } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q")?.toLowerCase() || "";
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const grade = searchParams.get("grade")?.toLowerCase();
    const location = searchParams.get("location")?.toLowerCase();
    const verification = searchParams.get("verification");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "active";

    let results = db.listings.filter((listing) => {
      // Status filter
      if (status !== "all" && listing.status !== status) {
        return false;
      }

      // Query filter: title, materialName, description, grade, category, city
      if (query) {
        const titleMatch = listing.title.toLowerCase().includes(query);
        const nameMatch = listing.materialName.toLowerCase().includes(query);
        const descMatch = listing.description.toLowerCase().includes(query);
        const gradeMatch = listing.grade.toLowerCase().includes(query);
        const catMatch = listing.materialCategory.toLowerCase().includes(query);
        const cityMatch = listing.city.toLowerCase().includes(query);
        const stateMatch = listing.state.toLowerCase().includes(query);
        const processMatch = listing.manufacturingProcess.toLowerCase().includes(query);

        if (!titleMatch && !nameMatch && !descMatch && !gradeMatch && !catMatch && !cityMatch && !stateMatch && !processMatch) {
          return false;
        }
      }

      // Category filter
      if (category && category !== "all" && listing.materialCategory !== category) {
        return false;
      }

      // Condition filter
      if (condition && condition !== "all" && listing.condition !== condition) {
        return false;
      }

      // Grade filter
      if (grade && !listing.grade.toLowerCase().includes(grade)) {
        return false;
      }

      // Location filter
      if (location) {
        const inCity = listing.city.toLowerCase().includes(location);
        const inState = listing.state.toLowerCase().includes(location);
        const inArea = listing.industrialArea.toLowerCase().includes(location);
        if (!inCity && !inState && !inArea) return false;
      }

      // Verification filter
      if (verification && verification !== "all" && listing.verificationState !== verification) {
        return false;
      }

      // Price filter
      if (minPrice !== null && listing.pricePerUnit < minPrice) return false;
      if (maxPrice !== null && listing.pricePerUnit > maxPrice) return false;

      return true;
    });

    // Sorting
    results.sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "price_asc") {
        return a.pricePerUnit - b.pricePerUnit;
      }
      if (sort === "price_desc") {
        return b.pricePerUnit - a.pricePerUnit;
      }
      if (sort === "qty_desc") {
        return b.totalQuantity - a.totalQuantity;
      }
      if (sort === "views") {
        return b.viewsCount - a.viewsCount;
      }
      return 0;
    });

    // Anonymize supplier if company has privacy level "matched_only" or "approval_required"
    const sanitizedResults = results.map(listing => {
      const company = db.companies.find(c => c.id === listing.supplierCompanyId);
      const isPrivate = company && company.privacyLevel !== 'public';
      return {
        ...listing,
        supplierName: isPrivate 
          ? `${company?.industry || "Industrial Manufacturer"} (${listing.city} region)` 
          : (company?.name || "Verified Industrial Supplier"),
        isCompanyPrivate: isPrivate,
      };
    });

    return NextResponse.json({
      success: true,
      count: sanitizedResults.length,
      listings: sanitizedResults,
    });
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();

    // Validation
    if (!body.title || !body.materialCategory || !body.totalQuantity || !body.pricePerUnit) {
      return NextResponse.json(
        { success: false, error: "Missing mandatory fields: title, category, quantity, price" },
        { status: 400 }
      );
    }

    if (body.totalQuantity <= 0) {
      return NextResponse.json({ success: false, error: "Quantity must be greater than zero." }, { status: 400 });
    }

    if (body.pricePerUnit < 0) {
      return NextResponse.json({ success: false, error: "Price cannot be negative." }, { status: 400 });
    }

    const newId = `lst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newListing: MaterialListing = {
      id: newId,
      supplierCompanyId: body.supplierCompanyId || "comp_apex_aero",
      supplierUserId: body.supplierUserId || "user_seller_anand",
      title: body.title,
      materialName: body.materialName || body.title,
      materialCategory: body.materialCategory,
      sourceIndustry: body.sourceIndustry || "Manufacturing",
      manufacturingProcess: body.manufacturingProcess || "Industrial processing",
      description: body.description || "",
      listingType: body.listingType || "sale",
      intendedReuse: body.intendedReuse || "",

      grade: body.grade || "Declared Commercial",
      alloyDesignation: body.alloyDesignation || "",
      chemicalComposition: body.chemicalComposition || "",
      standardSpec: body.standardSpec || "",
      hardness: body.hardness || "",
      testReportAvailable: Boolean(
        body.testReportAvailable || (body.documents && body.documents.some((d: any) => d.documentType === "test_report"))
      ),
      compositionCertAvailable: Boolean(
        body.compositionCertAvailable || (body.documents && body.documents.some((d: any) => d.documentType === "composition_cert"))
      ),
      specDeclaredOrVerified: body.specDeclaredOrVerified || "declared",

      dimensions: {
        length: body.dimensions?.length ? Number(body.dimensions.length) : undefined,
        width: body.dimensions?.width ? Number(body.dimensions.width) : undefined,
        heightOrThickness: body.dimensions?.heightOrThickness ? Number(body.dimensions.heightOrThickness) : undefined,
        diameter: body.dimensions?.diameter ? Number(body.dimensions.diameter) : undefined,
        wallThickness: body.dimensions?.wallThickness ? Number(body.dimensions.wallThickness) : undefined,
        particleOrChipSize: body.dimensions?.particleOrChipSize || undefined,
        shapeOrPhysicalForm: body.dimensions?.shapeOrPhysicalForm || "Standard solid piece",
        dimensionUnit: body.dimensions?.dimensionUnit || "mm",
        weightPerPiece: body.dimensions?.weightPerPiece ? Number(body.dimensions.weightPerPiece) : undefined,
        numberOfPieces: body.dimensions?.numberOfPieces ? Number(body.dimensions.numberOfPieces) : undefined,
      },

      totalQuantity: Number(body.totalQuantity),
      quantityUnit: body.quantityUnit || "kg",
      minOrderQuantity: body.minOrderQuantity ? Number(body.minOrderQuantity) : 100,
      pricePerUnit: Number(body.pricePerUnit),
      currency: body.currency || "INR",
      negotiable: Boolean(body.negotiable),
      availableImmediately: body.availableImmediately !== false,
      availabilityStartDate: body.availabilityStartDate || now.split("T")[0],
      expiryDate: body.expiryDate || undefined,
      recurringSupply: Boolean(body.recurringSupply),
      expectedMonthlyQuantity: body.expectedMonthlyQuantity ? Number(body.expectedMonthlyQuantity) : undefined,
      storageLoadingConstraints: body.storageLoadingConstraints || "",

      condition: body.condition || "clean",
      contaminationStatus: body.contaminationStatus || "Inspected standard",
      residualOilCoolant: Boolean(body.residualOilCoolant),
      rustOxidation: Boolean(body.rustOxidation),
      mixedGradeStatus: Boolean(body.mixedGradeStatus),
      sortingRequirements: body.sortingRequirements || "",
      cleaningProcessingReqs: body.cleaningProcessingReqs || "",
      inspectionStatus: body.inspectionStatus || "self_inspected",
      qualityNotes: body.qualityNotes || "",
      handlingRequirements: body.handlingRequirements || "",
      safetyInformation: body.safetyInformation || "",
      requiredProcessingBeforeReuse: body.requiredProcessingBeforeReuse || "",

      country: body.country || "India",
      state: body.state || "Maharashtra",
      city: body.city || "Pune",
      industrialArea: body.industrialArea || "Industrial Zone",
      postalCode: body.postalCode || "",
      latitude: body.latitude || 18.5204,
      longitude: body.longitude || 73.8567,
      pickupDeliveryPreference: body.pickupDeliveryPreference || "pickup_only",
      vehicleRestrictions: body.vehicleRestrictions || "",
      estimatedLoadingTime: body.estimatedLoadingTime || "1 hour",

      verificationState: body.isDraft ? "draft" : "pending_verification",
      status: body.isDraft ? "draft" : "active",
      viewsCount: 1,
      enquiriesCount: 0,

      images: Array.isArray(body.images) ? body.images : [],
      documents: Array.isArray(body.documents) ? body.documents : [],

      createdAt: now,
      updatedAt: now,
    };

    db.listings.unshift(newListing);

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: newListing.supplierUserId,
      action: body.isDraft ? "LISTING_DRAFT_SAVED" : "LISTING_CREATED",
      details: `Created listing "${newListing.title}" (${newListing.totalQuantity} ${newListing.quantityUnit})`,
      timestamp: now,
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: body.isDraft ? "Draft saved successfully" : "Material listing published successfully",
      listing: newListing,
    });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json({ success: false, error: "Failed to create listing" }, { status: 500 });
  }
}
