// scripts/enrich_companies_shipments.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(dbPath, 'utf-8');

// Add new companies if not present
const newCompanies = `    {
      id: "comp_bharat_tooling",
      name: "Bharat Tooling Works",
      industry: "Die & Mould Toolroom",
      subIndustry: "Stamping Punches & Cold Work Tooling",
      manufacturingProcess: "CNC Wire EDM, Hard Milling, Vacuum Heat Treatment",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      industrialArea: "Hadapsar Industrial Estate",
      privacyLevel: "public",
      verified: true,
      contactEmail: "orders@bharattooling.example.com",
      contactPhone: "+91 20 2687 5511",
      capabilities: ["ISO 9001:2015", "Hardness Testing (Rockwell/Vickers)", "Cryogenic Treatment"],
      description: "Specialized precision die and punch manufacturer consuming and generating certified D2, D3, and carbide scrap blocks."
    },
    {
      id: "comp_deccan_machining",
      name: "Deccan Machining Industries",
      industry: "Precision Brass & Valve Components",
      subIndustry: "Sanitary Fittings & LPG Valves",
      manufacturingProcess: "High-Speed Multi-Spindle Turning & Rotary Transfer",
      city: "Kolhapur",
      state: "Maharashtra",
      country: "India",
      industrialArea: "Shiroli MIDC",
      privacyLevel: "public",
      verified: true,
      contactEmail: "logistics@deccanmachining.example.com",
      contactPhone: "+91 231 260 4488",
      capabilities: ["Clean Segregation", "Centrifugal Oil Recovery", "Briquette Press"],
      description: "Large volume brass components manufacturer generating high-purity C36000 free-cutting brass chips."
    },
    {
      id: "comp_vertex_metalcraft",
      name: "Vertex Metalcraft Pvt Ltd",
      industry: "Chemical Equipment & Pressure Vessels",
      subIndustry: "SS316L Reactor Shells & Dished Ends",
      manufacturingProcess: "Plate Rolling, Plasma Beveling, SAW Welding",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      industrialArea: "Ambattur Industrial Estate",
      privacyLevel: "public",
      verified: true,
      contactEmail: "surplus@vertexmetalcraft.example.com",
      contactPhone: "+91 44 2625 9933",
      capabilities: ["ASME Boiler & Pressure Vessel Code", "PMI Spectrometry", "100% Radiography"],
      description: "Heavy chemical engineering fabrication shop handling austenitic stainless steel plates with full mill test certs."
    },
`;

if (!content.includes('comp_bharat_tooling')) {
  content = content.replace(
    /companies: \[/,
    `companies: [\n${newCompanies}`
  );
}

// Add GPS Status and additional shipments
if (!content.includes('gpsStatus: {')) {
  // Add GPS status to first shipment
  content = content.replace(
    /isDemoTracking: true,\s*currentCoordinates: \{ lat: 24\.5854, lng: 73\.7125 \},/,
    `isDemoTracking: true,
      currentCoordinates: { lat: 24.5854, lng: 73.7125 },
      gpsStatus: {
        simulatedSpeedKmh: 54,
        latitude: 24.5854,
        longitude: 73.7125,
        routeProgressPercent: 58,
        lastPingTimestamp: "2026-10-24T14:10:00Z",
        transponderStatus: "ACTIVE_ONLINE",
        driverName: "Mohan Rao",
        driverPhone: "+91 94220 78192",
        vehicleRegistration: "MH-14-GH-4920",
        eWayBillNumber: "EWB-88294-2026-IN",
        estimatedArrivalTimestamp: "2026-10-26T11:00:00Z"
      },`
  );
}

// Add shipments 2, 3, 4, 5 if not present
const extraShipments = `    {
      id: "ship_9902_bengaluru_pune",
      trackingNumber: "INDUS-TRK-67120",
      exchangeId: "exc_4411",
      listingId: "lst_al_billet_001",
      listingTitle: "Aerospace Grade 6061-T6 Aluminum Billet Cut-offs (1,000 kg)",
      buyerCompanyId: "comp_kalyani_fab",
      buyerCompanyName: "Kalyani Industrial Equipment",
      supplierCompanyId: "comp_apex_aero",
      supplierCompanyName: "Apex CNC Solutions",
      carrierName: "VRL Industrial Express Line",
      vehicleNumber: "KA-04-AB-8109 (Covered Container)",
      driverContact: "+91 98452 11982 (Ramesh Gouda)",
      origin: "Peenya Industrial Area, Bengaluru, KA",
      destination: "Bhosari MIDC, Pune, MH",
      distanceKm: 840,
      currentStage: 7,
      expectedCollectionDate: "2026-10-21",
      expectedDeliveryDate: "2026-10-24",
      actualCollectionDate: "2026-10-21T11:00:00Z",
      actualDeliveryDate: "2026-10-24T08:30:00Z",
      isDemoTracking: true,
      currentCoordinates: { lat: 18.6186, lng: 73.8370 },
      gpsStatus: {
        simulatedSpeedKmh: 0,
        latitude: 18.6186,
        longitude: 73.8370,
        routeProgressPercent: 100,
        lastPingTimestamp: "2026-10-24T08:30:00Z",
        transponderStatus: "STANDBY",
        driverName: "Ramesh Gouda",
        driverPhone: "+91 98452 11982",
        vehicleRegistration: "KA-04-AB-8109",
        eWayBillNumber: "EWB-67120-2026-IN",
        estimatedArrivalTimestamp: "2026-10-24T08:30:00Z"
      },
      timeline: [
        { stage: 1, stageName: "Awaiting collection", timestamp: "2026-10-20T10:00:00Z", location: "Peenya Phase 2", description: "Consignment packed on shrink pallets.", completed: true, operator: "Apex Dispatch Lead", source: "Operator Verification" },
        { stage: 2, stageName: "Collection scheduled", timestamp: "2026-10-21T08:00:00Z", location: "Peenya Loading Bay", description: "Vehicle reported and inspected.", completed: true, operator: "VRL Logistics", source: "Operator Verification" },
        { stage: 3, stageName: "Collected", timestamp: "2026-10-21T11:00:00Z", location: "Bengaluru Gate", description: "Weighbridge tare verified: 1000 kg net.", completed: true, operator: "Weighbridge Terminal", source: "Weighbridge Automated Scan" },
        { stage: 4, stageName: "In transit", timestamp: "2026-10-22T14:00:00Z", location: "NH-48 Hubli-Dharwad", description: "Transit on highway, GPS verified.", completed: true, operator: "GPS Telematics", source: "Simulated GPS" },
        { stage: 5, stageName: "Near destination", timestamp: "2026-10-23T20:00:00Z", location: "Pune Bypass Toll", description: "Arrival at entry checkpoint.", completed: true, operator: "Toll Telematics", source: "Simulated GPS" },
        { stage: 6, stageName: "Out for delivery", timestamp: "2026-10-24T06:00:00Z", location: "PCMC Corridor", description: "Last mile transit to Bhosari plant.", completed: true, operator: "VRL Local Hub", source: "Operator Verification" },
        { stage: 7, stageName: "Delivered", timestamp: "2026-10-24T08:30:00Z", location: "Kalyani Inbound Bay", description: "Vehicle unloaded and security pass verified.", completed: true, operator: "Kalyani Security", source: "Operator Verification" },
        { stage: 8, stageName: "Receipt confirmation pending", timestamp: "Expected 2026-10-24T16:00:00Z", location: "Quality QA Lab", description: "CMM dimension check and material cert verification in progress.", completed: false, operator: "QA Inspection", source: "Operator Verification" },
        { stage: 9, stageName: "Completed", timestamp: "Expected 2026-10-25T10:00:00Z", location: "Finance Clearance", description: "Escrow release and settlement.", completed: false, operator: "Induscycle Settlement", source: "Operator Verification" }
      ],
      receiptQuantityConfirmed: 1000,
      receiptConditionConfirmed: "accepted_good"
    },
    {
      id: "ship_9903_pune_local",
      trackingNumber: "INDUS-TRK-55198",
      exchangeId: "exc_4412",
      listingId: "lst_tool_steel_005",
      listingTitle: "Tool Steel D2 Punch & Die Scrap Blocks (500 kg)",
      buyerCompanyId: "comp_kalyani_fab",
      buyerCompanyName: "Kalyani Industrial Equipment",
      supplierCompanyId: "comp_bharat_tooling",
      supplierCompanyName: "Bharat Tooling Works",
      carrierName: "CityLogistics Dedicated Flatbed",
      vehicleNumber: "MH-12-PQ-3301",
      driverContact: "+91 98229 44011 (Dattatray Shinde)",
      origin: "Hadapsar Industrial Estate, Pune, MH",
      destination: "Bhosari MIDC, Pune, MH",
      distanceKm: 38,
      currentStage: 7,
      expectedCollectionDate: "2026-10-09",
      expectedDeliveryDate: "2026-10-10",
      actualCollectionDate: "2026-10-09T14:00:00Z",
      actualDeliveryDate: "2026-10-10T11:00:00Z",
      isDemoTracking: true,
      currentCoordinates: { lat: 18.6186, lng: 73.8370 },
      gpsStatus: {
        simulatedSpeedKmh: 0,
        latitude: 18.6186,
        longitude: 73.8370,
        routeProgressPercent: 100,
        lastPingTimestamp: "2026-10-10T11:00:00Z",
        transponderStatus: "STANDBY",
        driverName: "Dattatray Shinde",
        driverPhone: "+91 98229 44011",
        vehicleRegistration: "MH-12-PQ-3301",
        eWayBillNumber: "EWB-55198-2026-IN",
        estimatedArrivalTimestamp: "2026-10-10T11:00:00Z"
      },
      timeline: [
        { stage: 1, stageName: "Awaiting collection", timestamp: "2026-10-08T16:00:00Z", location: "Hadapsar Plant Gate", description: "Crated blocks tagged.", completed: true, operator: "Bharat Tooling Dispatch", source: "Operator Verification" },
        { stage: 2, stageName: "Collection scheduled", timestamp: "2026-10-09T09:00:00Z", location: "Hadapsar MIDC", description: "Flatbed reported.", completed: true, operator: "CityLogistics", source: "Operator Verification" },
        { stage: 3, stageName: "Collected", timestamp: "2026-10-09T14:00:00Z", location: "Hadapsar Gate", description: "Gross weight confirmed: 500 kg net.", completed: true, operator: "Weighbridge", source: "Weighbridge Automated Scan" },
        { stage: 4, stageName: "In transit", timestamp: "2026-10-10T08:00:00Z", location: "Pune Ring Road", description: "Intra-city transit via Katraj-Dehu bypass.", completed: true, operator: "Telematics", source: "Simulated GPS" },
        { stage: 5, stageName: "Near destination", timestamp: "2026-10-10T09:45:00Z", location: "Bhosari Entry", description: "Vehicle entered MIDC zone.", completed: true, operator: "Telematics", source: "Simulated GPS" },
        { stage: 6, stageName: "Out for delivery", timestamp: "2026-10-10T10:15:00Z", location: "Bhosari Sector 7", description: "Approaching receiver dock.", completed: true, operator: "CityLogistics", source: "Operator Verification" },
        { stage: 7, stageName: "Delivered", timestamp: "2026-10-10T11:00:00Z", location: "Kalyani Fabrication Bay", description: "Unloaded via overhead crane. Hardness tested 58 HRC.", completed: true, operator: "Kalyani Inbound QA", source: "Operator Verification" },
        { stage: 8, stageName: "Receipt confirmation pending", timestamp: "2026-10-10T14:00:00Z", location: "QA Station", description: "Material accepted good condition.", completed: true, operator: "QA Manager", source: "Operator Verification" },
        { stage: 9, stageName: "Completed", timestamp: "Expected 2026-10-20T17:00:00Z", location: "Accounts Payable", description: "Awaiting overdue payment clearance.", completed: false, operator: "Finance", source: "Operator Verification" }
      ],
      receiptQuantityConfirmed: 500,
      receiptConditionConfirmed: "accepted_good"
    },
    {
      id: "ship_9904_kolhapur_pune",
      trackingNumber: "INDUS-TRK-44901",
      exchangeId: "exc_4413",
      listingId: "lst_cnc_brass_004",
      listingTitle: "C36000 Free-Cutting Brass Needle Turnings (500 kg)",
      buyerCompanyId: "comp_kalyani_fab",
      buyerCompanyName: "Kalyani Industrial Equipment",
      supplierCompanyId: "comp_deccan_machining",
      supplierCompanyName: "Deccan Machining Industries",
      carrierName: "Deccan Freight Forwarders",
      vehicleNumber: "MH-09-CV-7814",
      driverContact: "+91 97630 18234 (Sanjay Patil)",
      origin: "Shiroli MIDC, Kolhapur, MH",
      destination: "Bhosari MIDC, Pune, MH",
      distanceKm: 235,
      currentStage: 7,
      expectedCollectionDate: "2026-10-22",
      expectedDeliveryDate: "2026-10-23",
      actualCollectionDate: "2026-10-22T10:00:00Z",
      actualDeliveryDate: "2026-10-23T15:30:00Z",
      isDemoTracking: true,
      currentCoordinates: { lat: 18.6186, lng: 73.8370 },
      gpsStatus: {
        simulatedSpeedKmh: 0,
        latitude: 18.6186,
        longitude: 73.8370,
        routeProgressPercent: 100,
        lastPingTimestamp: "2026-10-23T15:30:00Z",
        transponderStatus: "STANDBY",
        driverName: "Sanjay Patil",
        driverPhone: "+91 97630 18234",
        vehicleRegistration: "MH-09-CV-7814",
        eWayBillNumber: "EWB-44901-2026-IN",
        estimatedArrivalTimestamp: "2026-10-23T15:30:00Z"
      },
      timeline: [
        { stage: 1, stageName: "Awaiting collection", timestamp: "2026-10-21T17:00:00Z", location: "Shiroli Plant", description: "Bags staged for dispatch.", completed: true, operator: "Deccan Machining", source: "Operator Verification" },
        { stage: 2, stageName: "Collection scheduled", timestamp: "2026-10-22T08:00:00Z", location: "Shiroli Yard", description: "Vehicle loaded.", completed: true, operator: "Deccan Freight", source: "Operator Verification" },
        { stage: 3, stageName: "Collected", timestamp: "2026-10-22T10:00:00Z", location: "Shiroli Gate", description: "Tare slip: 500 kg net.", completed: true, operator: "Weighbridge", source: "Weighbridge Automated Scan" },
        { stage: 4, stageName: "In transit", timestamp: "2026-10-22T16:00:00Z", location: "NH-48 Satara", description: "Transit in progress.", completed: true, operator: "Telematics", source: "Simulated GPS" },
        { stage: 5, stageName: "Near destination", timestamp: "2026-10-23T11:00:00Z", location: "Pune Khed-Shivapur Toll", description: "Passed toll plaza.", completed: true, operator: "Toll Plaza", source: "Simulated GPS" },
        { stage: 6, stageName: "Out for delivery", timestamp: "2026-10-23T13:30:00Z", location: "Bhosari Sector 10", description: "Delivery transit.", completed: true, operator: "Deccan Freight", source: "Operator Verification" },
        { stage: 7, stageName: "Delivered", timestamp: "2026-10-23T15:30:00Z", location: "Kalyani Intake Bay", description: "Discrepancy noted: Invoiced 550 kg but weighbridge confirms 500 kg.", completed: true, operator: "Receiving Clerk", source: "Operator Verification" },
        { stage: 8, stageName: "Receipt confirmation pending", timestamp: "Expected 2026-10-24T10:00:00Z", location: "Commercial Audit", description: "Weight discrepancy flag under commercial review.", completed: false, operator: "Audit Team", source: "Operator Verification" },
        { stage: 9, stageName: "Completed", timestamp: "Expected 2026-10-27T17:00:00Z", location: "Settlement", description: "Pending reconciliation.", completed: false, operator: "Accounts", source: "Operator Verification" }
      ],
      receiptQuantityConfirmed: 500,
      receiptConditionConfirmed: "accepted_with_discrepancy",
      issueReported: "Quantity billed (550 kg) deviates from received weighbridge slip (500 kg)."
    },
    {
      id: "ship_9905_chennai_pune",
      trackingNumber: "INDUS-TRK-33829",
      exchangeId: "exc_4414",
      listingId: "lst_ss_sheet_002",
      listingTitle: "SS316L Reactor Vessel Plate Drop Ends (2,000 kg)",
      buyerCompanyId: "comp_kalyani_fab",
      buyerCompanyName: "Kalyani Industrial Equipment",
      supplierCompanyId: "comp_vertex_metalcraft",
      supplierCompanyName: "Vertex Metalcraft",
      carrierName: "Southern Star Inter-State Heavy Haul",
      vehicleNumber: "TN-02-AX-9022 (Air-Suspension Trailer)",
      driverContact: "+91 94441 55678 (K. Velu)",
      origin: "Ambattur Industrial Estate, Chennai, TN",
      destination: "Bhosari MIDC, Pune, MH",
      distanceKm: 1180,
      currentStage: 8,
      expectedCollectionDate: "2026-10-21",
      expectedDeliveryDate: "2026-10-24",
      actualCollectionDate: "2026-10-21T15:00:00Z",
      actualDeliveryDate: "2026-10-24T10:00:00Z",
      isDemoTracking: true,
      currentCoordinates: { lat: 18.6186, lng: 73.8370 },
      gpsStatus: {
        simulatedSpeedKmh: 0,
        latitude: 18.6186,
        longitude: 73.8370,
        routeProgressPercent: 98,
        lastPingTimestamp: "2026-10-24T11:00:00Z",
        transponderStatus: "STANDBY",
        driverName: "K. Velu",
        driverPhone: "+91 94441 55678",
        vehicleRegistration: "TN-02-AX-9022",
        eWayBillNumber: "EWB-33829-2026-IN",
        estimatedArrivalTimestamp: "2026-10-24T10:00:00Z"
      },
      timeline: [
        { stage: 1, stageName: "Awaiting collection", timestamp: "2026-10-20T14:00:00Z", location: "Ambattur Bay 3", description: "Stainless plates crated with edge protectors.", completed: true, operator: "Vertex Dispatch", source: "Operator Verification" },
        { stage: 2, stageName: "Collection scheduled", timestamp: "2026-10-21T09:00:00Z", location: "Ambattur Estate", description: "Heavy trailer docked.", completed: true, operator: "Southern Star", source: "Operator Verification" },
        { stage: 3, stageName: "Collected", timestamp: "2026-10-21T15:00:00Z", location: "Chennai Gate", description: "Tare: 2,000 kg net confirmed.", completed: true, operator: "Weighbridge", source: "Weighbridge Automated Scan" },
        { stage: 4, stageName: "In transit", timestamp: "2026-10-22T18:00:00Z", location: "Bengaluru-Pune Corridor", description: "Interstate highway transit.", completed: true, operator: "GPS Telematics", source: "Simulated GPS" },
        { stage: 5, stageName: "Near destination", timestamp: "2026-10-23T22:00:00Z", location: "Pune Hadapsar Entry", description: "Approaching metropolitan boundary.", completed: true, operator: "Telematics", source: "Simulated GPS" },
        { stage: 6, stageName: "Out for delivery", timestamp: "2026-10-24T07:00:00Z", location: "PCMC Arterial", description: "Final delivery transit.", completed: true, operator: "Southern Star", source: "Operator Verification" },
        { stage: 7, stageName: "Delivered", timestamp: "2026-10-24T10:00:00Z", location: "Kalyani Receiving Dock", description: "Plates received physically. Awaiting Spectrometer QA sign-off.", completed: true, operator: "Kalyani Material Intake", source: "Operator Verification" },
        { stage: 8, stageName: "Receipt confirmation pending", timestamp: "2026-10-24T11:00:00Z", location: "Metallurgical Lab", description: "Optical emission spectrometer test pending (Mo > 2.0% requirement).", completed: false, operator: "QA Metallurgist", source: "Operator Verification" },
        { stage: 9, stageName: "Completed", timestamp: "Expected 2026-10-26T14:00:00Z", location: "Escrow Settlement", description: "Final 30% milestone release.", completed: false, operator: "Induscycle Escrow", source: "Operator Verification" }
      ],
      receiptQuantityConfirmed: 2000
    },
`;

if (!content.includes('ship_9902_bengaluru_pune')) {
  content = content.replace(
    /shipments: \[([\s\S]*?poc_88294\.pdf",[\s\S]*?receiptConditionConfirmed: undefined\s*\})/,
    (match) => `${match},\n${extraShipments}`
  );
}

// In getDatabase, ensure companies and shipments are also updated if missing
if (!content.includes('cachedDb!.companies.some')) {
  content = content.replace(
    /if \(!cachedDb!\.industrialClusters\) cachedDb!\.industrialClusters = INITIAL_DATA\.industrialClusters;/,
    `if (!cachedDb!.industrialClusters) cachedDb!.industrialClusters = INITIAL_DATA.industrialClusters;
    INITIAL_DATA.companies.forEach((comp) => {
      if (!cachedDb!.companies.some((c) => c.id === comp.id)) {
        cachedDb!.companies.push(comp);
      }
    });
    INITIAL_DATA.shipments.forEach((ship) => {
      if (!cachedDb!.shipments.some((s) => s.id === ship.id)) {
        cachedDb!.shipments.push(ship);
      }
    });`
  );
}

fs.writeFileSync(dbPath, content, 'utf-8');
console.log('Successfully enriched companies and shipments in db.ts');
