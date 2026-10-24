// scripts/update_database_schema.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(dbPath, 'utf-8');

// 1. Update imports
if (!content.includes('SupplierInvoice')) {
  content = content.replace(
    /from ['"]@\/types['"];/,
    `IndustrialCluster,
  SupplierInvoice,
  PaymentMilestone,
  PaymentTransaction,
  ThreeWayMatch
} from '@/types';`
  );
}

// 2. Update DatabaseSchema interface
if (!content.includes('supplierInvoices: SupplierInvoice[];')) {
  content = content.replace(
    /invoices: Invoice\[\];/,
    `invoices: Invoice[];\n  supplierInvoices: SupplierInvoice[];`
  );
}

// 3. Add seed supplierInvoices to INITIAL_DATA
const seedSupplierInvoices = `
  supplierInvoices: [
    {
      id: "sinv_scenario_a_precision",
      invoiceNumber: "INV-2026-8801",
      supplierId: "comp_precision_forge",
      supplierName: "PrecisionForge Components",
      supplierGst: "27AAACP4410R1Z2",
      buyerName: "Rajesh Sharma",
      buyerCompanyName: "Kalyani Industrial Equipment",
      poId: "ord_2026_001",
      poNumber: "PO-2026-8801",
      shipmentId: "ship_9901_pune_faridabad",
      trackingNumber: "INDUS-TRK-88294",
      listingTitle: "Hot Forged EN8 / AISI 1045 Flashings (12,000 kg)",
      materialCategory: "Forging flash",
      invoiceDate: "2026-10-18",
      dueDate: "2026-10-24",
      paymentTerms: "Milestone (30/40/30)",
      invoiceAmount: 316830,
      paidAmount: 316830,
      outstandingBalance: 0,
      currency: "INR",
      shipmentStatus: "In transit (Stage 4 / Live GPS)",
      approvalStatus: "Approved",
      paymentStatus: "Paid",
      eligibilityStatus: "Eligible",
      eligibilityReason: "Contractual milestones cleared & 100% matched against PO & GRN-8829.",
      milestones: [
        { id: "m_a1", name: "Advance (30%)", percentage: 30, amount: 95049, condition: "Upon PO confirmation", status: "paid", verifiedAt: "2026-10-18" },
        { id: "m_a2", name: "Dispatch (40%)", percentage: 40, amount: 126732, condition: "Weighbridge & gate dispatch", status: "paid", verifiedAt: "2026-10-22" },
        { id: "m_a3", name: "Delivery & QA (30%)", percentage: 30, amount: 95049, condition: "Physical receipt & QA check", status: "paid", verifiedAt: "2026-10-23" }
      ],
      threeWayMatch: {
        matched: true,
        poNumber: "PO-2026-8801",
        poQuantity: 12000,
        poUnitRate: 24.5,
        poTotal: 316830,
        invoiceQuantity: 12000,
        invoiceUnitRate: 24.5,
        invoiceTotal: 316830,
        grnNumber: "GRN-2026-8829",
        grnQuantity: 12000,
        grnCondition: "Accepted Good Condition",
        quantityMatch: true,
        unitRateMatch: true,
        totalMatch: true,
        qualitySignOff: true,
        discrepancies: []
      },
      transactions: [
        {
          id: "txn_a1",
          invoiceId: "sinv_scenario_a_precision",
          transactionReference: "DEMO-TXN-2026-9912",
          amount: 316830,
          paymentDate: "2026-10-23T16:15:00Z",
          paymentMethod: "Industrial Verified Escrow (Test Mode)",
          processedBy: "Rajesh Sharma (Head of Procurement)",
          note: "Full contractual payment cleared following weighbridge confirmation.",
          status: "success"
        }
      ],
      scenarioTag: "Scenario A",
      isDemo: true,
      createdAt: "2026-10-18T10:00:00Z",
      updatedAt: "2026-10-23T16:15:00Z"
    },
    {
      id: "sinv_scenario_b_apex",
      invoiceNumber: "INV-2026-9102",
      supplierId: "comp_apex_aero",
      supplierName: "Apex CNC Solutions",
      supplierGst: "29AABCA9102K1ZP",
      buyerName: "Rajesh Sharma",
      buyerCompanyName: "Kalyani Industrial Equipment",
      poId: "ord_2026_002",
      poNumber: "PO-2026-9102",
      shipmentId: "ship_9902_bengaluru_pune",
      trackingNumber: "INDUS-TRK-67120",
      listingTitle: "Aerospace Grade 6061-T6 Aluminum Billet Cut-offs (1,000 kg)",
      materialCategory: "Billet cut-offs",
      invoiceDate: "2026-10-20",
      dueDate: "2026-10-29",
      paymentTerms: "Net 30",
      invoiceAmount: 245000,
      paidAmount: 0,
      outstandingBalance: 245000,
      currency: "INR",
      shipmentStatus: "Delivered (Stage 7)",
      approvalStatus: "Approved",
      paymentStatus: "Pending Payment",
      eligibilityStatus: "Eligible",
      eligibilityReason: "Approved by finance; 3-way match verified against GRN-6712; scheduled for payment due on 2026-10-29.",
      milestones: [
        { id: "m_b1", name: "Advance (20%)", percentage: 20, amount: 49000, condition: "On order confirmation", status: "verified", verifiedAt: "2026-10-20" },
        { id: "m_b2", name: "Delivery (50%)", percentage: 50, amount: 122500, condition: "Factory gate intake", status: "verified", verifiedAt: "2026-10-23" },
        { id: "m_b3", name: "Quality Clearance (30%)", percentage: 30, amount: 73500, condition: "CMM dimension check", status: "verified", verifiedAt: "2026-10-24" }
      ],
      threeWayMatch: {
        matched: true,
        poNumber: "PO-2026-9102",
        poQuantity: 1000,
        poUnitRate: 245,
        poTotal: 245000,
        invoiceQuantity: 1000,
        invoiceUnitRate: 245,
        invoiceTotal: 245000,
        grnNumber: "GRN-2026-6712",
        grnQuantity: 1000,
        grnCondition: "Accepted Good Condition",
        quantityMatch: true,
        unitRateMatch: true,
        totalMatch: true,
        qualitySignOff: true,
        discrepancies: []
      },
      transactions: [],
      scenarioTag: "Scenario B",
      isDemo: true,
      createdAt: "2026-10-20T11:00:00Z",
      updatedAt: "2026-10-24T09:00:00Z"
    },
    {
      id: "sinv_scenario_c_bharat",
      invoiceNumber: "INV-2026-7740",
      supplierId: "comp_bharat_tooling",
      supplierName: "Bharat Tooling Works",
      supplierGst: "27AABCB7740L1Z8",
      buyerName: "Rajesh Sharma",
      buyerCompanyName: "Kalyani Industrial Equipment",
      poId: "ord_2026_003",
      poNumber: "PO-2026-7740",
      shipmentId: "ship_9903_pune_local",
      trackingNumber: "INDUS-TRK-55198",
      listingTitle: "Tool Steel D2 Punch & Die Scrap Blocks (500 kg)",
      materialCategory: "Tool steel and carbide scrap",
      invoiceDate: "2026-10-05",
      dueDate: "2026-10-20",
      paymentTerms: "Net 15",
      invoiceAmount: 185000,
      paidAmount: 0,
      outstandingBalance: 185000,
      currency: "INR",
      shipmentStatus: "Delivered (Stage 7)",
      approvalStatus: "Approved",
      paymentStatus: "Overdue",
      eligibilityStatus: "Eligible",
      eligibilityReason: "Critical: Invoice approved but payment is 4 days overdue past contractual due date (2026-10-20). Payout priority: High.",
      milestones: [
        { id: "m_c1", name: "Delivery (100%)", percentage: 100, amount: 185000, condition: "Upon receipt and hardness test", status: "verified", verifiedAt: "2026-10-10" }
      ],
      threeWayMatch: {
        matched: true,
        poNumber: "PO-2026-7740",
        poQuantity: 500,
        poUnitRate: 370,
        poTotal: 185000,
        invoiceQuantity: 500,
        invoiceUnitRate: 370,
        invoiceTotal: 185000,
        grnNumber: "GRN-2026-5519",
        grnQuantity: 500,
        grnCondition: "Accepted Good Condition",
        quantityMatch: true,
        unitRateMatch: true,
        totalMatch: true,
        qualitySignOff: true,
        discrepancies: []
      },
      transactions: [],
      scenarioTag: "Scenario C",
      isDemo: true,
      createdAt: "2026-10-05T09:30:00Z",
      updatedAt: "2026-10-24T08:00:00Z"
    },
    {
      id: "sinv_scenario_d_deccan",
      invoiceNumber: "INV-2026-6210",
      supplierId: "comp_deccan_machining",
      supplierName: "Deccan Machining Industries",
      supplierGst: "27AACCD6210M1Z5",
      buyerName: "Rajesh Sharma",
      buyerCompanyName: "Kalyani Industrial Equipment",
      poId: "ord_2026_004",
      poNumber: "PO-2026-6210",
      shipmentId: "ship_9904_kolhapur_pune",
      trackingNumber: "INDUS-TRK-44901",
      listingTitle: "C36000 Free-Cutting Brass Needle Turnings (500 kg PO / 550 kg Inv)",
      materialCategory: "Copper and brass",
      invoiceDate: "2026-10-22",
      dueDate: "2026-10-27",
      paymentTerms: "Immediate upon Delivery",
      invoiceAmount: 140250,
      paidAmount: 0,
      outstandingBalance: 140250,
      currency: "INR",
      shipmentStatus: "Delivered (Stage 7 - Discrepancy)",
      approvalStatus: "Needs Clarification",
      paymentStatus: "Not Due",
      eligibilityStatus: "Blocked",
      eligibilityReason: "Blocked: 3-way match failure. Quantity billed (550 kg) exceeds PO (500 kg), and Unit Price billed (₹255.00/kg) exceeds PO (₹240.00/kg). Discrepancy under commercial review.",
      clarificationQuery: "Supplier billed 550 kg @ ₹255/kg (₹1,40,250), whereas approved PO-2026-6210 stipulates 500 kg @ ₹240/kg (₹1,20,000). Tare receipt records 500 kg net.",
      milestones: [
        { id: "m_d1", name: "Delivery & Inspection (100%)", percentage: 100, amount: 140250, condition: "Pending rate discrepancy reconciliation", status: "blocked" }
      ],
      threeWayMatch: {
        matched: false,
        poNumber: "PO-2026-6210",
        poQuantity: 500,
        poUnitRate: 240,
        poTotal: 120000,
        invoiceQuantity: 550,
        invoiceUnitRate: 255,
        invoiceTotal: 140250,
        grnNumber: "GRN-2026-4490",
        grnQuantity: 500,
        grnCondition: "Accepted with Discrepancy (+50 kg invoiced excess)",
        quantityMatch: false,
        unitRateMatch: false,
        totalMatch: false,
        qualitySignOff: true,
        discrepancies: [
          "Quantity billed (550 kg) exceeds PO quantity (500 kg) by +50 kg (+10.0%)",
          "Unit rate billed (₹255.00/kg) exceeds PO agreed rate (₹240.00/kg) by +₹15.00/kg (+6.25%)",
          "Total invoice value ₹1,40,250 exceeds authorized PO value ₹1,20,000 by +₹20,250"
        ]
      },
      transactions: [],
      scenarioTag: "Scenario D",
      isDemo: true,
      createdAt: "2026-10-22T14:00:00Z",
      updatedAt: "2026-10-24T10:15:00Z"
    },
    {
      id: "sinv_scenario_e_vertex",
      invoiceNumber: "INV-2026-5580",
      supplierId: "comp_vertex_metalcraft",
      supplierName: "Vertex Metalcraft",
      supplierGst: "33AACCV5580N1Z1",
      buyerName: "Rajesh Sharma",
      buyerCompanyName: "Kalyani Industrial Equipment",
      poId: "ord_2026_005",
      poNumber: "PO-2026-5580",
      shipmentId: "ship_9905_chennai_pune",
      trackingNumber: "INDUS-TRK-33829",
      listingTitle: "SS316L Reactor Vessel Plate Drop Ends (2,000 kg)",
      materialCategory: "Stainless steel",
      invoiceDate: "2026-10-21",
      dueDate: "2026-11-05",
      paymentTerms: "Milestone (30/40/30)",
      invoiceAmount: 480000,
      paidAmount: 336000,
      outstandingBalance: 144000,
      currency: "INR",
      shipmentStatus: "Receipt confirmation pending (Stage 8)",
      approvalStatus: "Under Review",
      paymentStatus: "Partially Paid",
      eligibilityStatus: "Pending evidence",
      eligibilityReason: "Pending evidence: 30% advance (₹1,44,000) and 40% dispatch (₹1,92,000) paid. Final 30% milestone (₹1,44,000) is locked pending Stage 8 metallurgical QA spectrometer certification.",
      milestones: [
        { id: "m_e1", name: "Advance (30%)", percentage: 30, amount: 144000, condition: "Upon PO confirmation", status: "paid", verifiedAt: "2026-10-21" },
        { id: "m_e2", name: "Dispatch (40%)", percentage: 40, amount: 192000, condition: "Upon electronic waybill generation", status: "paid", verifiedAt: "2026-10-23" },
        { id: "m_e3", name: "QA Laboratory Clearance (30%)", percentage: 30, amount: 144000, condition: "Optical emission spectrometer test report sign-off required", status: "pending" }
      ],
      threeWayMatch: {
        matched: false,
        poNumber: "PO-2026-5580",
        poQuantity: 2000,
        poUnitRate: 240,
        poTotal: 480000,
        invoiceQuantity: 2000,
        invoiceUnitRate: 240,
        invoiceTotal: 480000,
        grnNumber: "GRN-2026-3382",
        grnQuantity: 2000,
        grnCondition: "Awaiting Spectrometer Lab Certification",
        quantityMatch: true,
        unitRateMatch: true,
        totalMatch: true,
        qualitySignOff: false,
        discrepancies: [
          "Final milestone payout blocked: Awaiting Optical Emission Spectrometry Lab clearance for Molybdenum (Mo > 2.0%) certification."
        ]
      },
      transactions: [
        {
          id: "txn_e1",
          invoiceId: "sinv_scenario_e_vertex",
          transactionReference: "DEMO-TXN-2026-8101",
          amount: 144000,
          paymentDate: "2026-10-21T11:00:00Z",
          paymentMethod: "Industrial Verified Escrow (Test Mode)",
          processedBy: "Rajesh Sharma",
          note: "Contractual 30% advance payment released.",
          status: "success"
        },
        {
          id: "txn_e2",
          invoiceId: "sinv_scenario_e_vertex",
          transactionReference: "DEMO-TXN-2026-8102",
          amount: 192000,
          paymentDate: "2026-10-23T14:30:00Z",
          paymentMethod: "Industrial Verified Escrow (Test Mode)",
          processedBy: "Rajesh Sharma",
          note: "40% dispatch milestone cleared after weighbridge gate pass.",
          status: "success"
        }
      ],
      scenarioTag: "Scenario E",
      isDemo: true,
      createdAt: "2026-10-21T10:00:00Z",
      updatedAt: "2026-10-24T11:00:00Z"
    }
  ],`;

if (!content.includes('sinv_scenario_a_precision')) {
  content = content.replace(
    /invoices: \[[\s\S]*?\n  \],/,
    (match) => `${match}\n${seedSupplierInvoices}`
  );
}

// 4. Update getDatabase to auto-hydrate supplierInvoices
if (!content.includes('cachedDb!.supplierInvoices = INITIAL_DATA.supplierInvoices;')) {
  content = content.replace(
    /if \(!cachedDb!\.industrialClusters\) cachedDb!\.industrialClusters = INITIAL_DATA\.industrialClusters;/,
    `if (!cachedDb!.industrialClusters) cachedDb!.industrialClusters = INITIAL_DATA.industrialClusters;
    if (!cachedDb!.supplierInvoices || cachedDb!.supplierInvoices.length === 0) {
      cachedDb!.supplierInvoices = INITIAL_DATA.supplierInvoices;
    }`
  );
}

// Save back
fs.writeFileSync(dbPath, content, 'utf-8');
console.log('Successfully updated src/lib/db.ts');
