import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { Shipment, ShipmentStageNumber } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("tracking");

    if (trackingNumber) {
      const shipment = db.shipments.find(s => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase());
      if (!shipment) {
        return NextResponse.json({ success: false, error: "Tracking record not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, shipment });
    }

    return NextResponse.json({ success: true, shipments: db.shipments });
  } catch (error) {
    console.error("GET /api/shipments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch shipments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();

    const newShipmentId = `ship_${Date.now()}`;
    const trackingNumber = `INDUS-TRK-${Math.floor(10000 + Math.random() * 90000)}`;

    const STAGE_NAMES = [
      "Awaiting collection",
      "Collection scheduled",
      "Collected",
      "In transit",
      "Near destination",
      "Out for delivery",
      "Delivered",
      "Receipt confirmation pending",
      "Completed",
    ];

    const timeline = STAGE_NAMES.map((name, index) => ({
      stage: (index + 1) as ShipmentStageNumber,
      stageName: name,
      timestamp: index === 0 ? new Date().toISOString() : "Pending",
      location: index === 0 ? (body.origin || "Origin Plant") : "En route",
      description: index === 0 ? "Dispatch manifest created." : "Awaiting progression",
      completed: index === 0,
    }));

    const newShipment: Shipment = {
      id: newShipmentId,
      trackingNumber,
      exchangeId: body.exchangeId || `exc_${Date.now()}`,
      listingId: body.listingId || "lst_forge_flash_003",
      listingTitle: body.listingTitle || "Industrial Material Consignment",
      buyerCompanyId: body.buyerCompanyId || "comp_ecomelters",
      buyerCompanyName: body.buyerCompanyName || "EcoMelters Secondary Alloys",
      supplierCompanyId: body.supplierCompanyId || "comp_precision_forge",
      supplierCompanyName: body.supplierCompanyName || "Precision Auto Forgings Pvt Ltd",
      carrierName: body.carrierName || "Indus Logistics Carrier Partner",
      vehicleNumber: body.vehicleNumber || "MH-12-TR-9182",
      driverContact: body.driverContact || "+91 98221 00000",
      origin: body.origin || "Pune, Maharashtra",
      destination: body.destination || "Faridabad, Haryana",
      distanceKm: body.distanceKm || 1400,
      currentStage: 1,
      expectedCollectionDate: body.expectedCollectionDate || new Date().toISOString().split("T")[0],
      expectedDeliveryDate: body.expectedDeliveryDate || new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      isDemoTracking: true,
      currentCoordinates: { lat: 18.5204, lng: 73.8567 },
      timeline,
    };

    db.shipments.unshift(newShipment);
    saveDatabase(db);

    return NextResponse.json({ success: true, shipment: newShipment });
  } catch (error) {
    console.error("POST /api/shipments error:", error);
    return NextResponse.json({ success: false, error: "Failed to create shipment" }, { status: 500 });
  }
}
