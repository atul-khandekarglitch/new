import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { ShipmentStageNumber } from "@/types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const shipment = db.shipments.find((s) => s.id === params.id || s.trackingNumber === params.id);
    if (!shipment) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, shipment });
  } catch (error) {
    console.error("GET /api/shipments/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch shipment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const index = db.shipments.findIndex((s) => s.id === params.id || s.trackingNumber === params.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }

    const shipment = db.shipments[index];
    const nowIso = new Date().toISOString();

    if (body.action === "reset") {
      shipment.currentStage = 1;
      shipment.receiptConditionConfirmed = undefined;
      shipment.timeline = shipment.timeline.map((evt, idx) => ({
        ...evt,
        completed: idx === 0,
        timestamp: idx === 0 ? nowIso : "Pending",
      }));
      if (shipment.gpsStatus) {
        shipment.gpsStatus.routeProgressPercent = 5;
        shipment.gpsStatus.simulatedSpeedKmh = 0;
        shipment.gpsStatus.transponderStatus = "STANDBY";
        shipment.gpsStatus.lastPingTimestamp = nowIso;
      }
    } else if (body.action === "step_forward") {
      const nextStage = Math.min(9, shipment.currentStage + 1) as ShipmentStageNumber;
      shipment.currentStage = nextStage;

      // Mark timeline up to nextStage as completed
      shipment.timeline = shipment.timeline.map((evt) => {
        if (evt.stage <= nextStage) {
          return {
            ...evt,
            completed: true,
            timestamp: evt.completed ? evt.timestamp : nowIso,
            operator: evt.operator || (nextStage >= 7 ? "Faridabad Receiver Security & QA" : "Logistics Hub Dispatcher"),
            source: evt.source || (nextStage === 4 ? "Simulated GPS" : "Operator Verification"),
          };
        }
        return evt;
      });

      // Update mock coordinates along route
      if (nextStage === 5) shipment.currentCoordinates = { lat: 27.1767, lng: 77.0369 }; // Agra / NCR
      if (nextStage >= 7) shipment.currentCoordinates = { lat: 28.4089, lng: 77.3178 }; // Faridabad destination

      const progressMap: Record<number, number> = {
        1: 5, 2: 15, 3: 25, 4: 58, 5: 75, 6: 88, 7: 95, 8: 98, 9: 100
      };

      if (shipment.gpsStatus) {
        shipment.gpsStatus.routeProgressPercent = progressMap[nextStage] || 50;
        shipment.gpsStatus.simulatedSpeedKmh = nextStage >= 7 ? 0 : (nextStage === 4 ? 54 : 38);
        shipment.gpsStatus.transponderStatus = nextStage >= 7 ? "STANDBY" : "ACTIVE_ONLINE";
        shipment.gpsStatus.lastPingTimestamp = nowIso;
      }

      if (nextStage === 9) {
        shipment.receiptConditionConfirmed = "accepted_good";
      }
    }

    if (body.issueReported) {
      shipment.issueReported = body.issueReported;
    }

    if (body.receiptConditionConfirmed) {
      shipment.receiptConditionConfirmed = body.receiptConditionConfirmed;
      shipment.receiptQuantityConfirmed = body.receiptQuantityConfirmed || shipment.receiptQuantityConfirmed;
      if (body.receiptConditionConfirmed === "accepted_good") {
        shipment.currentStage = 9;
        if (shipment.gpsStatus) {
          shipment.gpsStatus.routeProgressPercent = 100;
          shipment.gpsStatus.simulatedSpeedKmh = 0;
          shipment.gpsStatus.transponderStatus = "STANDBY";
        }
      }
    }

    db.shipments[index] = shipment;
    saveDatabase(db);

    return NextResponse.json({ success: true, shipment });
  } catch (error) {
    console.error("PUT /api/shipments/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update shipment" }, { status: 500 });
  }
}
