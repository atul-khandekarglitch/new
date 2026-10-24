import { BuyerRequirement, CompatibilityResult, MaterialListing } from "@/types";

export function evaluateCompatibility(
  listing: MaterialListing,
  requirement: BuyerRequirement
): CompatibilityResult {
  const matchedFields: { label: string; value: string; matchDetail: string }[] = [];
  const conflictingFields: { label: string; buyerReq: string; listingValue: string; reason: string }[] = [];
  const missingFields: { label: string; importance: 'critical' | 'moderate' | 'low'; recommendation: string }[] = [];
  const recommendations: string[] = [];

  let score = 50;

  // 1. Material Category check (Deterministic Hard Rule)
  if (listing.materialCategory === requirement.materialCategory) {
    matchedFields.push({
      label: "Material Category",
      value: listing.materialCategory,
      matchDetail: "Exact category alignment"
    });
    score += 20;
  } else {
    conflictingFields.push({
      label: "Material Category",
      buyerReq: requirement.materialCategory,
      listingValue: listing.materialCategory,
      reason: "Buyer requires distinct material category; substitution is generally not allowed without metallurgic re-qualification."
    });
    score -= 40;
  }

  // 2. Material Grade & Specification Check
  const buyerGrade = requirement.requiredGrade.trim().toLowerCase();
  const listingGrade = listing.grade.trim().toLowerCase();

  if (listingGrade.includes("unknown") || listingGrade === "" || listingGrade.includes("unspecified")) {
    missingFields.push({
      label: "Material Grade & Metallurgical Standard",
      importance: "critical",
      recommendation: "Request Spectrometric chemical analysis or Mill Test Report (MTR) before remelting or machining."
    });
    score -= 15;
  } else if (buyerGrade === "any" || buyerGrade === "commercial" || listingGrade.includes(buyerGrade) || buyerGrade.includes(listingGrade)) {
    matchedFields.push({
      label: "Material Grade",
      value: listing.grade,
      matchDetail: `Declared grade (${listing.grade}) matches buyer requirement (${requirement.requiredGrade})`
    });
    score += 15;
  } else {
    conflictingFields.push({
      label: "Material Grade",
      buyerReq: requirement.requiredGrade,
      listingValue: listing.grade,
      reason: `Grade difference may fail mechanical strength or chemical corrosion thresholds.`
    });
    score -= 25;
  }

  // 3. Quantity check
  if (listing.totalQuantity >= requirement.quantityRequired) {
    matchedFields.push({
      label: "Quantity Sufficiency",
      value: `${listing.totalQuantity} ${listing.quantityUnit}`,
      matchDetail: `Available stock covers 100% of required ${requirement.quantityRequired} ${requirement.quantityUnit}`
    });
    score += 10;
  } else if (listing.totalQuantity >= requirement.quantityRequired * 0.4) {
    matchedFields.push({
      label: "Partial Quantity Available",
      value: `${listing.totalQuantity} ${listing.quantityUnit}`,
      matchDetail: `Can fulfill ${Math.round((listing.totalQuantity / requirement.quantityRequired) * 100)}% of demand.`
    });
    recommendations.push("Consider partial batch procurement or recurring monthly replenishment.");
    score += 5;
  } else {
    conflictingFields.push({
      label: "Quantity Available",
      buyerReq: `${requirement.quantityRequired} ${requirement.quantityUnit}`,
      listingValue: `${listing.totalQuantity} ${listing.quantityUnit}`,
      reason: "Available quantity is substantially below minimum buyer procurement batch."
    });
    score -= 10;
  }

  // 4. Quality & Condition
  if (requirement.conditionAcceptable && requirement.conditionAcceptable.length > 0) {
    const isConditionAllowed = requirement.conditionAcceptable.some(
      c => c.toLowerCase() === listing.condition.toLowerCase()
    );
    if (isConditionAllowed) {
      matchedFields.push({
        label: "Surface Condition",
        value: listing.condition,
        matchDetail: `Listing condition (${listing.condition}) is acceptable to buyer process.`
      });
      score += 10;
    } else {
      conflictingFields.push({
        label: "Surface Condition & Contamination",
        buyerReq: requirement.conditionAcceptable.join(", "),
        listingValue: `${listing.condition} (${listing.contaminationStatus || "Standard"})`,
        reason: "Condition may introduce tooling wear or remelting dross unless cleaned."
      });
      score -= 15;
    }
  }

  // 5. Certification & Verification
  if (requirement.requiredCertifications && requirement.requiredCertifications.length > 0) {
    for (const cert of requirement.requiredCertifications) {
      if (cert.toLowerCase().includes("test report") || cert.toLowerCase().includes("mtr")) {
        if (listing.testReportAvailable) {
          matchedFields.push({
            label: "Material Test Report (MTR)",
            value: "Available",
            matchDetail: "Supplier has uploaded supporting test documentation."
          });
          score += 10;
        } else {
          missingFields.push({
            label: "Material Test Report (MTR)",
            importance: "critical",
            recommendation: "Buyer mandates certified MTR; request third-party lab verification or supplier upload."
          });
          score -= 15;
        }
      }
      if (cert.toLowerCase().includes("composition")) {
        if (listing.compositionCertAvailable) {
          matchedFields.push({
            label: "Chemical Composition Certificate",
            value: "Available",
            matchDetail: "Certificate available for verification."
          });
          score += 5;
        } else {
          missingFields.push({
            label: "Chemical Composition Certificate",
            importance: "moderate",
            recommendation: "Confirm elemental composition via optical emission spectrometry."
          });
        }
      }
    }
  }

  // 6. Dimensions check if applicable
  if (listing.dimensions) {
    const dims = listing.dimensions;
    if (dims.length && dims.width && dims.heightOrThickness) {
      matchedFields.push({
        label: "Dimensions Declared",
        value: `${dims.length} × ${dims.width} × ${dims.heightOrThickness} ${dims.dimensionUnit}`,
        matchDetail: "Full 3D physical envelope documented."
      });
    } else if (dims.diameter) {
      matchedFields.push({
        label: "Billet / Bar Diameter",
        value: `Ø ${dims.diameter} ${dims.dimensionUnit} (Length: ${dims.length || 'varies'} ${dims.dimensionUnit})`,
        matchDetail: "Cylindrical cross-section specified."
      });
    } else {
      missingFields.push({
        label: "Physical Dimensions",
        importance: "low",
        recommendation: "Dimensional tolerances should be confirmed for tight CNC clamping or blank nesting."
      });
    }
  }

  // Clamp score
  score = Math.max(10, Math.min(98, score));

  // Determine status deterministically
  let status: CompatibilityResult['status'];
  if (conflictingFields.length > 0) {
    status = 'Incompatible';
  } else if (missingFields.some(f => f.importance === 'critical')) {
    status = 'Potentially Compatible';
    recommendations.push("Complete document verification or perform optical emission spectroscopy prior to commercial commitment.");
  } else if (score >= 75) {
    status = 'Compatible';
    recommendations.push("Material meets all stated parameters. Ready to generate formal RFQ or transport quote.");
  } else if (matchedFields.length < 2) {
    status = 'Insufficient Information';
    recommendations.push("Listing lacks essential metallurgical and dimensional specifics to make a reliable determination.");
  } else {
    status = 'Potentially Compatible';
  }

  const explanation = status === 'Compatible'
    ? `This listing is highly recommended because the material category (${listing.materialCategory}), stated grade (${listing.grade}), quantity sufficiency, and condition match buyer specifications with verified documentation.`
    : status === 'Potentially Compatible'
    ? `A viable match is feasible because the material category and core metrics align. However, key details (such as ${missingFields.map(f => f.label).join(", ") || "test verification"}) require supplier confirmation before fabrication.`
    : status === 'Incompatible'
    ? `This by-product is marked incompatible due to conflicts in: ${conflictingFields.map(f => f.label).join(", ")}. Using this material risks production defects or mechanical non-compliance.`
    : `There is insufficient metallurgical and quality data to assess engineering compatibility with high confidence.`;

  return {
    status,
    score,
    matchedFields,
    conflictingFields,
    missingFields,
    explanation,
    actionableRecommendations: recommendations,
  };
}
