import { NextRequest, NextResponse } from "next/server";
import { calculateDeliveredCost, simulateBuyerWhatIf, simulateSellerWhatIf } from "@/lib/costCalculator";
import { TransportCalculationInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = body.mode || "standard";

    if (mode === "what_if_buyer") {
      const result = simulateBuyerWhatIf(body.scenario);
      return NextResponse.json({ success: true, result });
    }

    if (mode === "what_if_seller") {
      const result = simulateSellerWhatIf(body.scenario);
      return NextResponse.json({ success: true, result });
    }

    const input: TransportCalculationInput = {
      quantity: Number(body.quantity) || 1000,
      unit: body.unit || "kg",
      materialPricePerUnit: Number(body.materialPricePerUnit) || 100,
      origin: body.origin || "Origin Plant",
      destination: body.destination || "Destination Facility",
      distanceKm: Number(body.distanceKm) || 250,
      transportMethod: body.transportMethod || "Road (Covered Truck)",
      transportRatePerKm: Number(body.transportRatePerKm) || 35,
      loadingUnloadingRate: Number(body.loadingUnloadingRate) || 1.5,
      packagingHandling: Number(body.packagingHandling) || 1.0,
      sortingCleaning: Number(body.sortingCleaning) || 0,
      cuttingSizeReduction: Number(body.cuttingSizeReduction) || 0,
      meltingProcessing: Number(body.meltingProcessing) || 0,
      testingCertification: Number(body.testingCertification) || 3500,
      applicableTaxesPercent: Number(body.applicableTaxesPercent) || 18,
    };

    const calculation = calculateDeliveredCost(input);

    return NextResponse.json({
      success: true,
      input,
      calculation,
    });
  } catch (error) {
    console.error("POST /api/cost-estimate error:", error);
    return NextResponse.json({ success: false, error: "Calculation failed" }, { status: 500 });
  }
}
