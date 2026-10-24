const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'tracking', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const defaultShipmentCode = `const DEFAULT_SHIPMENT: Shipment = {
  id: "ship_9901_pune_faridabad",
  trackingNumber: "INDUS-TRK-88294",
  exchangeId: "exc_4410",
  listingId: "lst_forge_flash_003",
  listingTitle: "Hot Forged EN8 / AISI 1045 Flashings (12,000 kg)",
  buyerCompanyId: "comp_ecomelters",
  buyerCompanyName: "EcoMelters Secondary Alloys",
  supplierCompanyId: "comp_precision_forge",
  supplierCompanyName: "Precision Auto Forgings Pvt Ltd",
  carrierName: "Mahindra Logistics Industrial Express",
  vehicleNumber: "MH-14-GH-4920 (28ft Multi-Axle)",
  driverContact: "+91 94220 78192 (Mohan Rao)",
  origin: "Chakan Industrial Zone, Pune, MH",
  destination: "Sector 58 Industrial Zone, Faridabad, HR",
  distanceKm: 1420,
  currentStage: 4,
  expectedCollectionDate: "2026-10-22",
  expectedDeliveryDate: "2026-10-26",
  actualCollectionDate: "2026-10-22T15:30:00Z",
  isDemoTracking: true,
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
  },
  timeline: [
    { stage: 1, stageName: "Awaiting collection", timestamp: "2026-10-21T16:00:00Z", location: "Pune Factory Hub", description: "Dispatch bay reserved; electronic consignment waybill generated.", completed: true, operator: "Chakan Dispatch Lead", source: "Operator Verification" },
    { stage: 2, stageName: "Collection scheduled", timestamp: "2026-10-22T08:00:00Z", location: "Chakan MIDC Phase 3", description: "Vehicle MH-14-GH-4920 reported at factory gate security.", completed: true, operator: "Mahindra Logistics", source: "Operator Verification" },
    { stage: 3, stageName: "Collected", timestamp: "2026-10-22T15:30:00Z", location: "Precision Forgings Plant Gate 2", description: "Tare weight & gross weight verified on weighbridge (Gross: 27,450 kg). Loaded & sealed.", completed: true, operator: "Weighbridge Terminal", source: "Weighbridge Automated Scan" },
    { stage: 4, stageName: "In transit", timestamp: "2026-10-24T14:10:00Z", location: "NH-48 Corridor (Udaipur Bypass)", description: "GPS transponder active; vehicle progressing toward Delhi-NCR corridor on schedule.", completed: true, operator: "GPS Telematics", source: "Simulated GPS" },
    { stage: 5, stageName: "Near destination", timestamp: "Expected 2026-10-25T18:00:00Z", location: "Gurugram / Ballabhgarh entry checkpoint", description: "Pending toll clearance and green corridor verification.", completed: false, operator: "Checkpoint Toll", source: "Simulated GPS" },
    { stage: 6, stageName: "Out for delivery", timestamp: "Expected 2026-10-26T07:30:00Z", location: "Sector 58 Faridabad industrial bypass", description: "Local route dispatch scheduled for receiver plant.", completed: false, operator: "Faridabad Hub", source: "Operator Verification" },
    { stage: 7, stageName: "Delivered", timestamp: "Expected 2026-10-26T11:00:00Z", location: "EcoMelters Inbound Unloading Bay", description: "Vehicle arrival and security check-in.", completed: false, operator: "EcoMelters Security", source: "Operator Verification" },
    { stage: 8, stageName: "Receipt confirmation pending", timestamp: "Expected 2026-10-26T14:00:00Z", location: "Buyer Quality QA Lab", description: "Receiver weighbridge tally and optical emission spectrometer QA sampling.", completed: false, operator: "QA Lab", source: "Operator Verification" },
    { stage: 9, stageName: "Completed", timestamp: "Expected 2026-10-26T16:00:00Z", location: "Induscycle Escrow Settlement", description: "Digital Proof of Delivery accepted; transaction completed.", completed: false, operator: "Escrow Admin", source: "Operator Verification" }
  ],
  proofOfCollectionDoc: "/docs/shipments/poc_88294.pdf"
};
`;

if (!content.includes('DEFAULT_SHIPMENT: Shipment')) {
  content = content.replace(
    /export default function TrackingPage\(\) \{/,
    `${defaultShipmentCode}\nexport default function TrackingPage() {`
  );

  content = content.replace(
    /const \[shipments, setShipments\] = useState<Shipment\[\]>\(\[\]\);/,
    `const [shipments, setShipments] = useState<Shipment[]>([DEFAULT_SHIPMENT]);`
  );

  content = content.replace(
    /const \[selectedShipment, setSelectedShipment\] = useState<Shipment \| null>\(null\);/,
    `const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(DEFAULT_SHIPMENT);`
  );
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully set DEFAULT_SHIPMENT in tracking page');
