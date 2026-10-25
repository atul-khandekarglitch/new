import fs from 'fs';
import path from 'path';
import { 
  Company, 
  User, 
  MaterialListing, 
  BuyerRequirement, 
  Shipment, 
  DisclosureRequest, 
  SavedSearch, 
  EnquiryOffer,
  Order,
  OrderItem,
  Payment,
  Invoice,
  IndustrialCluster,
  SupplierInvoice,
  PaymentMilestone,
  PaymentTransaction,
  ThreeWayMatch,
  EmailNotification
} from '@/types';

export interface DatabaseSchema {
  companies: Company[];
  users: User[];
  listings: MaterialListing[];
  buyerRequirements: BuyerRequirement[];
  shipments: Shipment[];
  disclosureRequests: DisclosureRequest[];
  savedSearches: SavedSearch[];
  enquiries: EnquiryOffer[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  invoices: Invoice[];
  supplierInvoices: SupplierInvoice[];
  industrialClusters: IndustrialCluster[];
  auditLogs: {
    id: string;
    userId: string;
    action: string;
    details: string;
    timestamp: string;
  }[];
  notifications?: EmailNotification[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'connector_db.json');

// SVG Data URLs for industrial materials
export const SVG_ASSETS = {
  steel_sheet: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="50%" stop-color="%23334155"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23cbd5e1"/><stop offset="50%" stop-color="%2394a3b8"/><stop offset="100%" stop-color="%2364748b"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g1)"/><rect x="60" y="80" width="320" height="220" rx="8" fill="url(%23metal)" transform="rotate(-5 220 190)" opacity="0.9" stroke="%23475569" stroke-width="3"/><rect x="180" y="110" width="340" height="210" rx="6" fill="url(%23metal)" transform="rotate(8 350 215)" opacity="0.8" stroke="%23334155" stroke-width="3"/><rect x="120" y="130" width="280" height="170" rx="4" fill="%23e2e8f0" opacity="0.95" stroke="%2364748b" stroke-width="2"/><text x="40" y="50" fill="%2338bdf8" font-family="sans-serif" font-weight="bold" font-size="18">STAINLESS STEEL 304 OFFCUTS</text><text x="40" y="370" fill="%2394a3b8" font-family="sans-serif" font-size="14">Thickness: 3.0mm • Laser &amp; Shearing Residues</text></svg>`,
  aluminum_billet: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230c1e3d"/><stop offset="100%" stop-color="%23060d1f"/></linearGradient><linearGradient id="al" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23e2e8f0"/><stop offset="40%" stop-color="%23ffffff"/><stop offset="70%" stop-color="%23cbd5e1"/><stop offset="100%" stop-color="%2394a3b8"/></linearGradient></defs><rect width="600" height="400" fill="url(%23bg)"/><g transform="translate(100, 100)"><ellipse cx="140" cy="80" rx="70" ry="35" fill="url(%23al)" stroke="%2364748b" stroke-width="2"/><path d="M 70,80 L 70,200 A 70,35 0 0,0 210,200 L 210,80 Z" fill="url(%23al)" stroke="%23475569" stroke-width="2"/><ellipse cx="140" cy="200" rx="70" ry="35" fill="%2394a3b8" opacity="0.3"/><ellipse cx="320" cy="110" rx="60" ry="30" fill="url(%23al)" stroke="%2364748b" stroke-width="2"/><path d="M 260,110 L 260,220 A 60,30 0 0,0 380,220 L 380,110 Z" fill="url(%23al)" stroke="%23475569" stroke-width="2"/></g><text x="40" y="50" fill="%2360a5fa" font-family="sans-serif" font-weight="bold" font-size="18">ALUMINUM 6061-T6 BILLET CUTS</text><text x="40" y="370" fill="%2394a3b8" font-family="sans-serif" font-size="14">Dia: 120mm • Length: 80-250mm • Certified Spec</text></svg>`,
  forging_flash: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="forgeBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a1006"/><stop offset="100%" stop-color="%230a0602"/></linearGradient><linearGradient id="rust" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23b45309"/><stop offset="50%" stop-color="%2378350f"/><stop offset="100%" stop-color="%23451a03"/></linearGradient></defs><rect width="600" height="400" fill="url(%23forgeBg)"/><path d="M 80,180 Q 150,110 240,150 T 400,120 T 520,200 Q 420,270 320,240 T 160,260 Z" fill="url(%23rust)" stroke="%23d97706" stroke-width="2"/><circle cx="280" cy="190" r="45" fill="%231f2937" stroke="%2378350f" stroke-width="4"/><text x="40" y="50" fill="%23f59e0b" font-family="sans-serif" font-weight="bold" font-size="18">HOT FORGED EN8 FLASHINGS</text><text x="40" y="370" fill="%2394a3b8" font-family="sans-serif" font-size="14">Heavy Trimming Scraps • 0.40% C Carbon Content</text></svg>`,
  cnc_brass: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="brassBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="50%" stop-color="%23eab308"/><stop offset="100%" stop-color="%23a16207"/></linearGradient></defs><rect width="600" height="400" fill="url(%23brassBg)"/><g fill="url(%23gold)" stroke="%23ca8a04" stroke-width="1.5"><path d="M 120,160 Q 160,120 200,150 T 260,140 Q 240,180 180,180 Z"/><path d="M 280,130 Q 340,90 380,140 T 440,120 Q 410,170 340,160 Z"/><path d="M 160,220 Q 220,180 270,230 T 350,210 Q 310,260 230,250 Z"/><path d="M 330,200 Q 400,160 460,210 T 520,190 Q 470,250 390,240 Z"/></g><text x="40" y="50" fill="%23eab308" font-family="sans-serif" font-weight="bold" font-size="18">CNC BRASS C36000 TURNINGS</text><text x="40" y="370" fill="%2394a3b8" font-family="sans-serif" font-size="14">Free-Cutting Brass • Degreased &amp; Dry Briquetted</text></svg>`,
  tool_steel: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="tsBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="d2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2394a3b8"/><stop offset="50%" stop-color="%23475569"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><rect width="600" height="400" fill="url(%23tsBg)"/><rect x="140" y="120" width="300" height="150" fill="url(%23d2)" stroke="%23818cf8" stroke-width="2" transform="skewX(-10)"/><text x="40" y="50" fill="%23818cf8" font-family="sans-serif" font-weight="bold" font-size="18">TOOL STEEL D2 / SKD11 BLOCKS</text><text x="40" y="370" fill="%2394a3b8" font-family="sans-serif" font-size="14">Die &amp; Punch Scrap Blocks • High Carbon High Chrome</text></svg>`,
  default_industrial: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="defaultBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%230265ff"/></linearGradient></defs><rect width="600" height="400" fill="url(%23defaultBg)"/><circle cx="300" cy="180" r="70" fill="none" stroke="url(%23accentG)" stroke-width="4" stroke-dasharray="10 8"/><path d="M 270,180 L 330,180 M 300,150 L 300,210" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><text x="300" y="300" fill="%23e2e8f0" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">INDUSCYCLE CERTIFIED MATERIAL</text><text x="300" y="330" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Physical Sample Pending Supplier Photo Upload</text></svg>`,
};

const INITIAL_DATA: DatabaseSchema = {
  companies: [
    {
      id: "comp_apex_aero",
      name: "Apex Aerospace Components Ltd.",
      industry: "Aerospace & Defence Machining",
      subIndustry: "Precision CNC Aircraft Components",
      manufacturingProcess: "5-Axis High Speed Milling & Turning",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      industrialArea: "Peenya Industrial Area",
      privacyLevel: "public",
      verified: true,
      contactEmail: "surplus@apexaero.example.com",
      contactPhone: "+91 80 2839 4401",
      capabilities: ["AS9100D Certified", "In-house CMM Inspection", "Clean Alloy Separation"],
      description: "Leading aerospace Tier-1 machining structural aluminum, titanium, and nickel alloys with strict batch segregation."
    },
    {
      id: "comp_precision_forge",
      name: "Precision Auto Forgings Pvt Ltd",
      industry: "Automotive Forgings",
      subIndustry: "Crankshafts & Connecting Rods",
      manufacturingProcess: "Closed-Die Drop Hammer & Press Forging",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      industrialArea: "Chakan Industrial Zone",
      privacyLevel: "public",
      verified: true,
      contactEmail: "materials@precisionforge.example.com",
      contactPhone: "+91 2135 678 900",
      capabilities: ["IATF 16949", "Optical Emission Spectrometer Lab", "Automated Shot Blasting"],
      description: "Automotive forging facility with regular generation of clean carbon and alloy steel flashings and billet ends."
    },
    {
      id: "comp_aerostruct_sheet",
      name: "AeroSheet Fabtech Works",
      industry: "Sheet Metal & Enclosures",
      subIndustry: "Cleanroom Equipment & Medical Consoles",
      manufacturingProcess: "Fiber Laser Cutting & CNC Bending",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      industrialArea: "Sriperumbudur Industrial Corridor",
      privacyLevel: "matched_only",
      verified: true,
      contactEmail: "logistics@aerosheetfab.example.com",
      contactPhone: "+91 44 4710 2200",
      capabilities: ["ISO 9001:2015", "Nitrogen Assist Laser Cutting", "Protective Film Handling"],
      description: "Sheet metal facility processing stainless steel sheets with documented chemical trace certificates."
    },
    {
      id: "comp_kalyani_fab",
      name: "Kalyani Industrial Equipment",
      industry: "Heavy Fabrication & Processing Machinery",
      subIndustry: "Cement & Sugar Mill Machinery",
      manufacturingProcess: "Heavy Plate Rolling, Submerged Arc Welding",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      industrialArea: "Bhosari MIDC",
      privacyLevel: "public",
      verified: true,
      contactEmail: "procure@kalyaniequip.example.com",
      contactPhone: "+91 20 2712 3344",
      capabilities: ["ASME U-Stamp", "Ultrasonic Plate Testing", "Hydraulic Press Brake 1200T"],
      description: "High-volume consumer of heavy steel offcuts, boiler quality plates, and structural sections."
    },
    {
      id: "comp_ecomelters",
      name: "EcoMelters Secondary Alloys",
      industry: "Secondary Smelting & Refining",
      subIndustry: "Recycled Ingot Foundry",
      manufacturingProcess: "Induction Melting & Continuous Casting",
      city: "Faridabad",
      state: "Haryana",
      country: "India",
      industrialArea: "Sector 58 Industrial Zone",
      privacyLevel: "public",
      verified: true,
      contactEmail: "intake@ecomelters.example.com",
      contactPhone: "+91 129 401 8899",
      capabilities: ["Recycling License Category A", "Vacuum Degassing", "XRF Spectrometry"],
      description: "Authorized secondary smelter consuming aluminum, brass, and copper industrial turnings and solids."
    }
  ],

  users: [
    {
      id: "user_buyer_rajesh",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@kalyaniequip.example.com",
      phone: "+91 98220 11223",
      role: "buyer",
      companyId: "comp_kalyani_fab",
      createdAt: "2026-01-15T10:00:00Z"
    },
    {
      id: "user_seller_anand",
      name: "Anand Verma",
      email: "anand.verma@apexaero.example.com",
      phone: "+91 98450 33445",
      role: "seller",
      companyId: "comp_apex_aero",
      createdAt: "2026-02-10T14:30:00Z"
    },
    {
      id: "user_dual_vikram",
      name: "Vikram Patel",
      email: "vikram.patel@precisionforge.example.com",
      phone: "+91 98230 55667",
      role: "both",
      companyId: "comp_precision_forge",
      createdAt: "2026-02-20T09:15:00Z"
    }
  ],

  listings: [
    {
      id: "lst_al_billet_001",
      supplierCompanyId: "comp_apex_aero",
      supplierUserId: "user_seller_anand",
      title: "Aerospace Grade 6061-T6 Aluminum Billet Cut-offs",
      materialName: "Aluminum 6061-T6 Extruded Billet Ends",
      materialCategory: "Billet cut-offs",
      sourceIndustry: "Aerospace & Defence Component Machining",
      manufacturingProcess: "Cold Saw Cutting from Certified 120mm & 150mm Extruded Billets",
      description: "Uniform billet cut-offs generated during CNC preparation of aircraft bracket fittings. Batch tagged with mill certificates, 100% clean, no coolants, stacked on wooden pallets.",
      listingType: "sale",
      intendedReuse: "Secondary CNC precision machining, forging slugs, or remelting into high-spec cast alloys.",
      
      grade: "6061-T6 (Al-Mg-Si)",
      alloyDesignation: "AA6061 / UNS A96061 / EN AW-6061",
      chemicalComposition: "Si: 0.40-0.80%, Fe: 0.70% max, Cu: 0.15-0.40%, Mn: 0.15% max, Mg: 0.80-1.20%, Cr: 0.04-0.35%, Zn: 0.25% max, Ti: 0.15% max, Bal: Al",
      standardSpec: "AMS 4117 / ASTM B221 / QQ-A-200/8",
      hardness: "95 HB / 60 HRB",
      testReportAvailable: true,
      compositionCertAvailable: true,
      specDeclaredOrVerified: "verified",

      dimensions: {
        diameter: 120,
        length: 150,
        dimensionUnit: "mm",
        weightPerPiece: 4.6,
        numberOfPieces: 540,
        shapeOrPhysicalForm: "Cylindrical Solid Billet Cut-off"
      },

      totalQuantity: 2480,
      quantityUnit: "kg",
      minOrderQuantity: 500,
      pricePerUnit: 245,
      currency: "INR",
      negotiable: true,
      availableImmediately: true,
      availabilityStartDate: "2026-10-24",
      recurringSupply: true,
      expectedMonthlyQuantity: 1800,
      storageLoadingConstraints: "Covered warehouse storage; forklift available for pallet loading.",

      condition: "clean",
      contaminationStatus: "Dry, non-contaminated, no mixed grades",
      residualOilCoolant: false,
      rustOxidation: false,
      mixedGradeStatus: false,
      sortingRequirements: "None required; 100% segregated by lot number.",
      inspectionStatus: "third_party_inspected",
      qualityNotes: "Ultrasonically tested billets prior to saw cutting; full traceability preserved.",
      handlingRequirements: "Band strapped on wooden pallets, shrink-wrapped.",
      safetyInformation: "Non-hazardous solid metal.",
      requiredProcessingBeforeReuse: "Ready for direct re-machining or remelting.",

      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      industrialArea: "Peenya Industrial Area Phase 2",
      postalCode: "560058",
      latitude: 13.0285,
      longitude: 77.5197,
      pickupDeliveryPreference: "pickup_only",
      vehicleRestrictions: "Up to 32-foot multi-axle truck accessible.",
      estimatedLoadingTime: "45 minutes",

      verificationState: "verified",
      status: "active",
      viewsCount: 384,
      enquiriesCount: 14,

      images: [
        {
          id: "img_al_1",
          listingId: "lst_al_billet_001",
          storagePath: SVG_ASSETS.aluminum_billet,
          originalFilename: "billet_cutoffs_batch_a.svg",
          contentType: "image/svg+xml",
          fileSize: 45000,
          isPrimary: true,
          displayOrder: 1,
          uploadedAt: "2026-10-20T11:00:00Z"
        }
      ],

      documents: [
        {
          id: "doc_al_mtr",
          listingId: "lst_al_billet_001",
          title: "Apex_Al6061T6_Mill_Test_Report_Lot992.pdf",
          documentType: "test_report",
          storagePath: "/docs/verified/al6061_mtr.pdf",
          verificationState: "verified",
          reviewerId: "sys_verifier_metallurgy",
          reviewerName: "National Metallurgical Lab Verifier",
          reviewTimestamp: "2026-10-21T09:30:00Z",
          expiryDate: "2027-10-20",
          isConfidential: false,
          fileSize: "1.4 MB"
        }
      ],

      createdAt: "2026-10-20T10:30:00Z",
      updatedAt: "2026-10-22T16:00:00Z"
    },

    {
      id: "lst_ss_sheet_002",
      supplierCompanyId: "comp_aerostruct_sheet",
      supplierUserId: "user_buyer_rajesh",
      title: "Stainless Steel 304 Sheet Laser Offcuts (3.0mm & 4.0mm)",
      materialName: "SS304 Cold Rolled Sheet Metal Skeleton Offcuts",
      materialCategory: "Sheet-metal offcuts",
      sourceIndustry: "Precision Medical & Electronics Enclosure Fabrication",
      manufacturingProcess: "CNC Fiber Laser Cutting (High-pressure N2 assist)",
      description: "Clean SS304 skeleton strips and plate drop ends with original PVC protective film intact. No dross or burr on edges, dry and indoor-stored.",
      listingType: "sale",
      intendedReuse: "Stamping smaller brackets, washers, architectural hardware, or remelting.",

      grade: "AISI 304 / EN 1.4301 / X5CrNi18-10",
      alloyDesignation: "UNS S30400 / SUS 304",
      chemicalComposition: "Cr: 18.0-20.0%, Ni: 8.0-10.5%, C: 0.08% max, Mn: 2.0% max, Si: 0.75% max, P: 0.045% max, S: 0.030% max",
      standardSpec: "ASTM A240 / ASME SA240",
      hardness: "170-190 HV",
      testReportAvailable: true,
      compositionCertAvailable: true,
      specDeclaredOrVerified: "verified",

      dimensions: {
        length: 800,
        width: 350,
        heightOrThickness: 3.0,
        dimensionUnit: "mm",
        shapeOrPhysicalForm: "Flat Plate / Rectangular Sheet Drop End",
        weightPerPiece: 6.7,
        numberOfPieces: 320
      },

      totalQuantity: 2150,
      quantityUnit: "kg",
      minOrderQuantity: 400,
      pricePerUnit: 185,
      currency: "INR",
      negotiable: true,
      availableImmediately: true,
      availabilityStartDate: "2026-10-22",
      recurringSupply: true,
      expectedMonthlyQuantity: 2500,
      storageLoadingConstraints: "Stacked flat on heavy wooden pallets.",

      condition: "clean",
      contaminationStatus: "Clean, laser grade, laser film intact on top face",
      residualOilCoolant: false,
      rustOxidation: false,
      mixedGradeStatus: false,
      sortingRequirements: "Pre-sorted by thickness (3mm in Lot A, 4mm in Lot B)",
      inspectionStatus: "self_inspected",
      qualityNotes: "Prime European & Indian steel mill origin certificates available.",
      handlingRequirements: "Crane or forklift loading available on site.",
      safetyInformation: "Sharp laser-cut edges; cut-resistant gloves required.",
      requiredProcessingBeforeReuse: "De-filming or shearing to custom sizes.",

      country: "India",
      state: "Tamil Nadu",
      city: "Chennai",
      industrialArea: "Sriperumbudur Industrial Corridor",
      postalCode: "602105",
      latitude: 12.9698,
      longitude: 79.9482,
      pickupDeliveryPreference: "negotiable",
      vehicleRestrictions: "Trailer or 20ft container access available.",
      estimatedLoadingTime: "30 minutes",

      verificationState: "verified",
      status: "active",
      viewsCount: 295,
      enquiriesCount: 9,

      images: [
        {
          id: "img_ss_1",
          listingId: "lst_ss_sheet_002",
          storagePath: SVG_ASSETS.steel_sheet,
          originalFilename: "ss304_laser_skeletons.svg",
          contentType: "image/svg+xml",
          fileSize: 42000,
          isPrimary: true,
          displayOrder: 1,
          uploadedAt: "2026-10-22T08:00:00Z"
        }
      ],

      documents: [
        {
          id: "doc_ss_mtr",
          listingId: "lst_ss_sheet_002",
          title: "SS304_Jindal_Stainless_MTR_Certificate.pdf",
          documentType: "test_report",
          storagePath: "/docs/verified/ss304_mtr.pdf",
          verificationState: "verified",
          reviewerId: "sys_verifier_metallurgy",
          reviewerName: "National Metallurgical Lab Verifier",
          reviewTimestamp: "2026-10-22T10:15:00Z",
          isConfidential: false,
          fileSize: "2.1 MB"
        }
      ],

      createdAt: "2026-10-22T07:45:00Z",
      updatedAt: "2026-10-23T11:20:00Z"
    },

    {
      id: "lst_forge_flash_003",
      supplierCompanyId: "comp_precision_forge",
      supplierUserId: "user_dual_vikram",
      title: "Hot Forged EN8 / AISI 1045 Flashings and Trimmings",
      materialName: "Forging Flash Rings and Trimming Webs",
      materialCategory: "Forging flash",
      sourceIndustry: "Automotive Transmission and Axle Forgings",
      manufacturingProcess: "Closed-Die Drop Forging followed by Mechanical Press Trimming",
      description: "Consistent medium carbon forging flash rings from automotive gear blanks. Clean, shot-blasted to remove heavy forge scale, homogeneous batch from single heat number.",
      listingType: "sale",
      intendedReuse: "Direct electric arc or induction remelting, secondary rerolling into reinforcement bars or grinding balls.",

      grade: "EN8 / AISI 1045 / C45",
      alloyDesignation: "080M40 (BS 970)",
      chemicalComposition: "C: 0.40-0.45%, Mn: 0.60-0.90%, Si: 0.15-0.35%, S: 0.040% max, P: 0.040% max",
      standardSpec: "IS 5517 / BS 970 / DIN 17200",
      hardness: "200-240 HB as forged",
      testReportAvailable: true,
      compositionCertAvailable: true,
      specDeclaredOrVerified: "verified",

      dimensions: {
        diameter: 180,
        heightOrThickness: 12,
        dimensionUnit: "mm",
        shapeOrPhysicalForm: "Circular Flash Ring with Center Web Punch-out",
        weightPerPiece: 1.8,
        numberOfPieces: 8500
      },

      totalQuantity: 15300,
      quantityUnit: "kg",
      minOrderQuantity: 3000,
      pricePerUnit: 48,
      currency: "INR",
      negotiable: true,
      availableImmediately: true,
      availabilityStartDate: "2026-10-18",
      recurringSupply: true,
      expectedMonthlyQuantity: 25000,
      storageLoadingConstraints: "Bulk loaded in tipping trailers or steel stillages.",

      condition: "clean",
      contaminationStatus: "Shot blasted, no oil, zero hazardous coating",
      residualOilCoolant: false,
      rustOxidation: false,
      mixedGradeStatus: false,
      sortingRequirements: "None. Dedicated stillages from Press Line 4.",
      inspectionStatus: "third_party_inspected",
      qualityNotes: "Heat certificate verified; certified low tramp elements (Cu < 0.12%, Sn < 0.02%).",
      handlingRequirements: "Magnet crane or excavator with orange peel grab.",
      safetyInformation: "Heavy bulk solids; hard hat and safety boots mandatory during loading.",
      requiredProcessingBeforeReuse: "Ready for direct induction furnace charging.",

      country: "India",
      state: "Maharashtra",
      city: "Pune",
      industrialArea: "Chakan Industrial Zone Phase 3",
      postalCode: "410501",
      latitude: 18.7606,
      longitude: 73.8567,
      pickupDeliveryPreference: "pickup_only",
      vehicleRestrictions: "Tippers and multi-axle trailers permitted 24x7.",
      estimatedLoadingTime: "40 minutes per 15 tonnes",

      verificationState: "verified",
      status: "active",
      viewsCount: 412,
      enquiriesCount: 18,

      images: [
        {
          id: "img_forge_1",
          listingId: "lst_forge_flash_003",
          storagePath: SVG_ASSETS.forging_flash,
          originalFilename: "en8_forging_flash.svg",
          contentType: "image/svg+xml",
          fileSize: 39000,
          isPrimary: true,
          displayOrder: 1,
          uploadedAt: "2026-10-18T14:00:00Z"
        }
      ],

      documents: [
        {
          id: "doc_forge_heat",
          listingId: "lst_forge_flash_003",
          title: "EN8_Heat_Analysis_Report_Heat5512.pdf",
          documentType: "composition_cert",
          storagePath: "/docs/verified/en8_heat_5512.pdf",
          verificationState: "verified",
          reviewerId: "sys_verifier_metallurgy",
          reviewerName: "National Metallurgical Lab Verifier",
          reviewTimestamp: "2026-10-19T11:00:00Z",
          isConfidential: false,
          fileSize: "1.1 MB"
        }
      ],

      createdAt: "2026-10-18T12:00:00Z",
      updatedAt: "2026-10-23T18:00:00Z"
    },

    {
      id: "lst_cnc_brass_004",
      supplierCompanyId: "comp_apex_aero",
      supplierUserId: "user_seller_anand",
      title: "Centrifugally Degreased Free-Cutting Brass C36000 Turnings",
      materialName: "Brass Swarf / Needle Chips (CuZn39Pb3)",
      materialCategory: "CNC machining chips and turnings",
      sourceIndustry: "High-precision Instrument Valve Machining",
      manufacturingProcess: "CNC Turning followed by continuous vacuum centrifuge degreasing",
      description: "Dry, sparkling clean brass needle turnings with under 0.2% residual moisture/oil. Free from iron contamination (in-line magnetic separator passed).",
      listingType: "sale",
      intendedReuse: "Ingot foundry remelting for continuous extrusion billets or sand casting.",

      grade: "C36000 Free-Cutting Brass / CW614N",
      alloyDesignation: "UNS C36000 / IS 319 Grade 1",
      chemicalComposition: "Cu: 60.0-63.0%, Pb: 2.5-3.7%, Fe: 0.35% max, Zn: Remainder",
      standardSpec: "ASTM B16 / EN 12164",
      hardness: "N/A (Turnings)",
      testReportAvailable: true,
      compositionCertAvailable: true,
      specDeclaredOrVerified: "verified",

      dimensions: {
        particleOrChipSize: "Needle turnings 5mm - 20mm curl length",
        shapeOrPhysicalForm: "Fine helical chips",
        dimensionUnit: "mm"
      },

      totalQuantity: 4200,
      quantityUnit: "kg",
      minOrderQuantity: 1000,
      pricePerUnit: 510,
      currency: "INR",
      negotiable: true,
      availableImmediately: true,
      availabilityStartDate: "2026-10-21",
      recurringSupply: true,
      expectedMonthlyQuantity: 3500,
      storageLoadingConstraints: "Packaged in heavy-duty 1-tonne FIBC jumbo bags with inner moisture liner.",

      condition: "clean",
      contaminationStatus: "Centrifuge degreased, moisture < 0.2%, Fe < 0.05%",
      residualOilCoolant: false,
      rustOxidation: false,
      mixedGradeStatus: false,
      sortingRequirements: "Dedicated machine line 100% C36000 only.",
      inspectionStatus: "third_party_inspected",
      qualityNotes: "Assayed via XRF spectrometer on every 1-tonne bag.",
      handlingRequirements: "Palletized jumbo bags; keep dry.",
      safetyInformation: "Wear dust mask when opening bags.",
      requiredProcessingBeforeReuse: "Direct melting or briquetting.",

      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      industrialArea: "Peenya Industrial Area Phase 2",
      postalCode: "560058",
      latitude: 13.0285,
      longitude: 77.5197,
      pickupDeliveryPreference: "pickup_only",
      vehicleRestrictions: "Covered container truck recommended.",
      estimatedLoadingTime: "25 minutes",

      verificationState: "verified",
      status: "active",
      viewsCount: 310,
      enquiriesCount: 11,

      images: [
        {
          id: "img_brass_1",
          listingId: "lst_cnc_brass_004",
          storagePath: SVG_ASSETS.cnc_brass,
          originalFilename: "brass_c36000_turnings.svg",
          contentType: "image/svg+xml",
          fileSize: 41000,
          isPrimary: true,
          displayOrder: 1,
          uploadedAt: "2026-10-21T09:00:00Z"
        }
      ],

      documents: [
        {
          id: "doc_brass_spectro",
          listingId: "lst_cnc_brass_004",
          title: "Brass_C36000_XRF_Analysis_Oct2026.pdf",
          documentType: "composition_cert",
          storagePath: "/docs/verified/brass_c36000_xrf.pdf",
          verificationState: "verified",
          reviewerId: "sys_verifier_metallurgy",
          reviewerName: "National Metallurgical Lab Verifier",
          reviewTimestamp: "2026-10-21T12:00:00Z",
          isConfidential: false,
          fileSize: "1.8 MB"
        }
      ],

      createdAt: "2026-10-21T08:30:00Z",
      updatedAt: "2026-10-24T12:00:00Z"
    },

    {
      id: "lst_tool_steel_005",
      supplierCompanyId: "comp_precision_forge",
      supplierUserId: "user_dual_vikram",
      title: "Tool Steel D2 / AISI D2 Die Scrap Blocks",
      materialName: "High-Carbon High-Chromium Tool Steel Offcut Blocks",
      materialCategory: "Tool steel and carbide scrap",
      sourceIndustry: "Tool Room & Cold Stamping Die Manufacturing",
      manufacturingProcess: "Wire EDM & Milling from Pre-hardened Tooling Blocks",
      description: "Solid rectangular D2 blocks from trim die modifications. Premium European ESR (Electroslag Remelted) quality with exceptional wear resistance.",
      listingType: "sale",
      intendedReuse: "Smaller punches, shear blades, wear plates, or remelt stock.",

      grade: "AISI D2 / DIN 1.2379 / SKD11",
      alloyDesignation: "X153CrMoV12 / UNS T30402",
      chemicalComposition: "C: 1.55%, Cr: 11.8%, Mo: 0.80%, V: 0.80%, Fe: Balance",
      standardSpec: "ASTM A681 / DIN 17350",
      hardness: "58-60 HRC (annealed state option also available)",
      testReportAvailable: true,
      compositionCertAvailable: true,
      specDeclaredOrVerified: "declared",

      dimensions: {
        length: 240,
        width: 140,
        heightOrThickness: 65,
        dimensionUnit: "mm",
        shapeOrPhysicalForm: "Rectangular Block",
        weightPerPiece: 17.1,
        numberOfPieces: 65
      },

      totalQuantity: 1110,
      quantityUnit: "kg",
      minOrderQuantity: 200,
      pricePerUnit: 340,
      currency: "INR",
      negotiable: true,
      availableImmediately: true,
      availabilityStartDate: "2026-10-15",
      recurringSupply: false,
      storageLoadingConstraints: "Boxed in wooden crates on pallets.",

      condition: "clean",
      contaminationStatus: "Clean, no coolant residues, light anti-rust oil coating",
      residualOilCoolant: true,
      rustOxidation: false,
      mixedGradeStatus: false,
      inspectionStatus: "self_inspected",
      qualityNotes: "Ultrasonic sound, no internal cracks from wire EDM.",
      handlingRequirements: "Heavy individual blocks; crane or manual hoist.",
      safetyInformation: "Presents pinch hazards; secure blocks before transit.",
      requiredProcessingBeforeReuse: "Soft annealing required if machining with conventional cutters.",

      country: "India",
      state: "Maharashtra",
      city: "Pune",
      industrialArea: "Chakan Industrial Zone",
      postalCode: "410501",
      latitude: 18.7606,
      longitude: 73.8567,
      pickupDeliveryPreference: "delivery_included",
      estimatedLoadingTime: "20 minutes",

      verificationState: "pending_verification",
      status: "active",
      viewsCount: 188,
      enquiriesCount: 6,

      images: [
        {
          id: "img_tool_1",
          listingId: "lst_tool_steel_005",
          storagePath: SVG_ASSETS.tool_steel,
          originalFilename: "d2_tool_steel_blocks.svg",
          contentType: "image/svg+xml",
          fileSize: 37000,
          isPrimary: true,
          displayOrder: 1,
          uploadedAt: "2026-10-15T15:00:00Z"
        }
      ],

      documents: [
        {
          id: "doc_tool_mtr",
          listingId: "lst_tool_steel_005",
          title: "D2_Tool_Steel_Bohler_Test_Sheet.pdf",
          documentType: "test_report",
          storagePath: "/docs/pending/d2_bohler_mtr.pdf",
          verificationState: "awaiting_review",
          isConfidential: true,
          fileSize: "920 KB"
        }
      ],

      createdAt: "2026-10-15T14:30:00Z",
      updatedAt: "2026-10-20T10:00:00Z"
    }
  ],

  buyerRequirements: [
    {
      id: "req_ss304_kalyani",
      buyerCompanyId: "comp_kalyani_fab",
      buyerUserId: "user_buyer_rajesh",
      title: "Stainless Steel 304 Sheet Offcuts (2mm to 5mm thickness)",
      materialCategory: "Sheet-metal offcuts",
      requiredGrade: "AISI 304",
      targetDimensions: "Min 400mm x 200mm, thickness 2.5 - 5.0mm",
      quantityRequired: 1500,
      quantityUnit: "kg",
      maxBudgetPerUnit: 200,
      currency: "INR",
      conditionAcceptable: ["clean"],
      requiredCertifications: ["Mill Test Report (MTR)", "Chemical Composition Certificate"],
      destinationCity: "Pune",
      destinationState: "Maharashtra",
      destinationIndustrialArea: "Bhosari MIDC",
      targetDate: "2026-11-15",
      isPrivate: false,
      status: "active",
      createdAt: "2026-10-19T10:00:00Z"
    },
    {
      id: "req_al6061_ecomelters",
      buyerCompanyId: "comp_ecomelters",
      buyerUserId: "user_buyer_rajesh",
      title: "Clean Aluminum 6061 Billet Ends & Heavy Solids",
      materialCategory: "Billet cut-offs",
      requiredGrade: "6061-T6",
      targetDimensions: "Diameter > 80mm, solid sections",
      quantityRequired: 2000,
      quantityUnit: "kg",
      maxBudgetPerUnit: 260,
      currency: "INR",
      conditionAcceptable: ["clean"],
      requiredCertifications: ["Mill Test Report (MTR)"],
      destinationCity: "Faridabad",
      destinationState: "Haryana",
      destinationIndustrialArea: "Sector 58",
      targetDate: "2026-11-20",
      isPrivate: true,
      status: "active",
      createdAt: "2026-10-21T11:00:00Z"
    },
    {
      id: "req_forging_ecomelters",
      buyerCompanyId: "comp_ecomelters",
      buyerUserId: "user_buyer_rajesh",
      title: "Medium Carbon Steel Forging Flashings (EN8 / AISI 1045)",
      materialCategory: "Forging flash",
      requiredGrade: "EN8 / AISI 1045",
      quantityRequired: 10000,
      quantityUnit: "kg",
      maxBudgetPerUnit: 52,
      currency: "INR",
      conditionAcceptable: ["clean"],
      requiredCertifications: ["Chemical Composition Certificate"],
      destinationCity: "Faridabad",
      destinationState: "Haryana",
      destinationIndustrialArea: "Sector 58",
      targetDate: "2026-11-30",
      isPrivate: false,
      status: "active",
      createdAt: "2026-10-22T14:00:00Z"
    }
  ],

  shipments: [
    {
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
        {
          stage: 1,
          stageName: "Awaiting collection",
          timestamp: "2026-10-21T16:00:00Z",
          location: "Pune Factory Hub",
          description: "Dispatch bay reserved; electronic consignment waybill generated.",
          completed: true
        },
        {
          stage: 2,
          stageName: "Collection scheduled",
          timestamp: "2026-10-22T08:00:00Z",
          location: "Chakan MIDC Phase 3",
          description: "Vehicle MH-14-GH-4920 reported at factory gate security.",
          completed: true
        },
        {
          stage: 3,
          stageName: "Collected",
          timestamp: "2026-10-22T15:30:00Z",
          location: "Precision Forgings Plant Gate 2",
          description: "Tare weight & gross weight verified on weighbridge (Gross: 27,450 kg). Loaded & sealed.",
          completed: true
        },
        {
          stage: 4,
          stageName: "In transit",
          timestamp: "2026-10-24T14:10:00Z",
          location: "NH-48 Corridor (Udaipur Bypass)",
          description: "GPS transponder active; vehicle progressing toward Delhi-NCR corridor on schedule.",
          completed: true
        },
        {
          stage: 5,
          stageName: "Near destination",
          timestamp: "Expected 2026-10-25T18:00:00Z",
          location: "Gurugram / Ballabhgarh entry checkpoint",
          description: "Pending toll clearance and green corridor verification.",
          completed: false
        },
        {
          stage: 6,
          stageName: "Out for delivery",
          timestamp: "Expected 2026-10-26T07:30:00Z",
          location: "Sector 58 Faridabad industrial bypass",
          description: "Local route dispatch scheduled for receiver plant.",
          completed: false
        },
        {
          stage: 7,
          stageName: "Delivered",
          timestamp: "Expected 2026-10-26T11:00:00Z",
          location: "EcoMelters Inbound Unloading Bay",
          description: "Vehicle arrival and security check-in.",
          completed: false
        },
        {
          stage: 8,
          stageName: "Receipt confirmation pending",
          timestamp: "Expected 2026-10-26T14:00:00Z",
          location: "Buyer Quality QA Lab",
          description: "Receiver weighbridge tally and optical emission spectrometer QA sampling.",
          completed: false
        },
        {
          stage: 9,
          stageName: "Completed",
          timestamp: "Expected 2026-10-26T16:00:00Z",
          location: "Induscycle Escrow Settlement",
          description: "Digital Proof of Delivery accepted; transaction completed.",
          completed: false
        }
      ],
      proofOfCollectionDoc: "/docs/shipments/poc_88294.pdf",
      receiptQuantityConfirmed: undefined,
      receiptConditionConfirmed: undefined
    }
  ],

  disclosureRequests: [
    {
      id: "req_disc_001",
      requesterCompanyId: "comp_kalyani_fab",
      requesterCompanyName: "Kalyani Industrial Equipment",
      targetCompanyId: "comp_aerostruct_sheet",
      targetCompanyName: "AeroSheet Fabtech Works (Auto-Anonymized)",
      listingId: "lst_ss_sheet_002",
      listingTitle: "Stainless Steel 304 Sheet Laser Offcuts",
      requestType: "contact_info",
      status: "pending",
      justification: "We have an immediate fabrication order for 1,500 kg SS304 brackets and wish to coordinate factory inspection and direct haulage.",
      createdAt: "2026-10-23T14:20:00Z",
      updatedAt: "2026-10-23T14:20:00Z"
    }
  ],

  savedSearches: [
    {
      id: "srch_101",
      userId: "user_buyer_rajesh",
      query: "SS304 sheet laser",
      category: "Sheet-metal offcuts",
      location: "Chennai / Pune",
      notifyOnMatch: true,
      createdAt: "2026-10-20T09:00:00Z"
    }
  ],

  enquiries: [
    {
      id: "enq_201",
      listingId: "lst_ss_sheet_002",
      listingTitle: "Stainless Steel 304 Sheet Laser Offcuts",
      buyerCompanyId: "comp_kalyani_fab",
      buyerCompanyName: "Kalyani Industrial Equipment",
      sellerCompanyId: "comp_aerostruct_sheet",
      sellerCompanyName: "AeroSheet Fabtech Works",
      type: "offer",
      offeredPrice: 180,
      quantity: 1500,
      message: "We can lift 1,500 kg immediately if supplied on wooden pallets with mill test report.",
      status: "pending",
      createdAt: "2026-10-23T15:00:00Z"
    }
  ],

  orders: [
    {
      id: "ord_2026_001",
      buyerId: "user_buyer_rajesh",
      buyerName: "Rajesh Sharma",
      buyerCompanyName: "Kalyani Industrial Equipment",
      buyerEmail: "rajesh.sharma@kalyaniequip.example.com",
      buyerPhone: "+91 98220 11223",
      buyerAddress: "Plot 42, Bhosari MIDC, Pune, Maharashtra 411026",
      sellerId: "user_seller_anand",
      sellerCompanyName: "Apex Aerospace Components Ltd.",
      sellerEmail: "surplus@apexaero.example.com",
      sellerCity: "Bengaluru",
      sellerState: "Karnataka",
      listingId: "lst_al_billet_001",
      status: "paid",
      subtotal: 245000,
      transportCost: 18500,
      processingCost: 5000,
      taxAmount: 48330,
      totalAmount: 316830,
      currency: "INR",
      items: [
        {
          id: "item_001",
          orderId: "ord_2026_001",
          listingId: "lst_al_billet_001",
          materialName: "Aerospace Grade 6061-T6 Aluminum Billet Cut-offs",
          materialCategory: "Billet cut-offs",
          grade: "6061-T6 (Al-Mg-Si)",
          quantity: 1000,
          unit: "kg",
          unitPrice: 245,
          lineTotal: 245000
        }
      ],
      invoiceId: "inv_2026_001",
      paymentId: "pay_2026_001",
      createdAt: "2026-10-23T16:00:00Z",
      updatedAt: "2026-10-23T16:15:00Z"
    }
  ],

  orderItems: [
    {
      id: "item_001",
      orderId: "ord_2026_001",
      listingId: "lst_al_billet_001",
      materialName: "Aerospace Grade 6061-T6 Aluminum Billet Cut-offs",
      materialCategory: "Billet cut-offs",
      grade: "6061-T6 (Al-Mg-Si)",
      quantity: 1000,
      unit: "kg",
      unitPrice: 245,
      lineTotal: 245000
    }
  ],

  payments: [
    {
      id: "pay_2026_001",
      orderId: "ord_2026_001",
      provider: "demo_gateway",
      providerPaymentReference: "PAY-INDUS-9912048",
      amount: 316830,
      currency: "INR",
      status: "confirmed",
      isTestMode: true,
      confirmedAt: "2026-10-23T16:15:00Z",
      createdAt: "2026-10-23T16:12:00Z"
    }
  ],

  invoices: [
    {
      id: "inv_2026_001",
      orderId: "ord_2026_001",
      invoiceNumber: "INV-2026-8801",
      invoiceDate: "2026-10-23",
      sellerDetails: {
        companyName: "Apex Aerospace Components Ltd.",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        industrialArea: "Peenya Industrial Area Phase 2",
        email: "surplus@apexaero.example.com",
        phone: "+91 80 2839 4401"
      },
      buyerDetails: {
        fullName: "Rajesh Sharma",
        companyName: "Kalyani Industrial Equipment",
        email: "rajesh.sharma@kalyaniequip.example.com",
        phone: "+91 98220 11223",
        city: "Pune",
        state: "Maharashtra"
      },
      materialDetails: {
        listingId: "lst_al_billet_001",
        materialName: "Aerospace Grade 6061-T6 Aluminum Billet Cut-offs",
        grade: "6061-T6 (Al-Mg-Si)",
        category: "Billet cut-offs",
        quantity: 1000,
        unit: "kg",
        unitPrice: 245
      },
      subtotal: 245000,
      transportCost: 18500,
      processingCost: 5000,
      taxAmount: 48330,
      totalAmount: 316830,
      currency: "INR",
      paymentStatus: "paid",
      paymentReference: "PAY-INDUS-9912048",
      paymentMethod: "Industrial Verified Escrow (Test Mode)",
      storagePath: "/invoices/INV-2026-8801.pdf",
      createdAt: "2026-10-23T16:15:00Z"
    }
  ],

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
  ],

  industrialClusters: [
    {
      id: "cluster_pune_pcmc",
      name: "Pune–Pimpri-Chinchwad Industrial Region",
      region: "Western Maharashtra",
      state: "Maharashtra",
      country: "India",
      coordinates: { lat: 18.6298, lng: 73.7997 },
      establishedYear: 1961,
      primaryIndustries: ["Automotive Assembly", "Precision Machining", "Heavy Fabrication", "Foundry & Casting"],
      keyMaterialsGenerated: ["Sheet-metal offcuts", "CNC machining chips and turnings", "Casting runners", "Forging flash"],
      keyMaterialsDemanded: ["Structural steel", "Pig iron", "Aluminium ingots", "Copper busbars"],
      estimatedCompaniesCount: 4200,
      activeListingsCount: 18,
      activeBuyersCount: 24,
      description: "One of Asia's largest automotive and precision engineering belts, housing Tata Motors, Bharat Forge, Mahindra, and over 4,000 tier-1/2 component suppliers.",
      tags: ["Automotive", "Forging", "Heavy Engineering"]
    },
    {
      id: "cluster_chakan",
      name: "Chakan Industrial Area (MIDC Phases 1-4)",
      region: "Pune Industrial Hub",
      state: "Maharashtra",
      country: "India",
      coordinates: { lat: 18.7606, lng: 73.8567 },
      establishedYear: 1998,
      primaryIndustries: ["Automotive Forgings", "Transmission Gear Machining", "Laser Stamping", "Die Casting"],
      keyMaterialsGenerated: ["Forging flash", "Tool steel and carbide scrap", "Billet cut-offs", "Steel offcuts"],
      keyMaterialsDemanded: ["Medium carbon alloy steels", "D2 tool steel", "Forging billets"],
      estimatedCompaniesCount: 1450,
      activeListingsCount: 12,
      activeBuyersCount: 15,
      description: "Dedicated mega-hub for drop-hammer and mechanical press forging, crankshafts, powertrain machining, and sheet-metal stamping.",
      tags: ["Drop Forging", "Automotive Powertrain", "High Carbon Steel"]
    },
    {
      id: "cluster_talegaon",
      name: "Talegaon Industrial Area",
      region: "Pune Outer Corridor",
      state: "Maharashtra",
      country: "India",
      coordinates: { lat: 18.7342, lng: 73.6741 },
      establishedYear: 2005,
      primaryIndustries: ["Electronics & Electrical Equipment", "Heavy Commercial Vehicles", "Precision Plastics"],
      keyMaterialsGenerated: ["Plastic production scrap", "Packaging materials", "Copper wire trimmings"],
      keyMaterialsDemanded: ["Engineering polymers", "CRCA steel coils", "Aluminium heatsinks"],
      estimatedCompaniesCount: 620,
      activeListingsCount: 6,
      activeBuyersCount: 8,
      description: "Modern high-tech industrial park featuring cleanrooms, electronics manufacturing, commercial vehicle assembly, and engineering plastics processing.",
      tags: ["Electronics", "Polymers", "Cleanroom"]
    },
    {
      id: "cluster_bhosari",
      name: "Bhosari MIDC Machinery & Tooling Belt",
      region: "PCMC Industrial Corridor",
      state: "Maharashtra",
      country: "India",
      coordinates: { lat: 18.6186, lng: 73.8370 },
      establishedYear: 1968,
      primaryIndustries: ["Boiler & Pressure Vessel Fabrication", "Die & Mould Tooling", "Hydraulic Presses"],
      keyMaterialsGenerated: ["Heavy steel plate offcuts", "Tool steel blocks", "Submerged arc welding flux"],
      keyMaterialsDemanded: ["Boiler quality plates", "IS 2062 carbon steel", "Hardened tool steel"],
      estimatedCompaniesCount: 2100,
      activeListingsCount: 9,
      activeBuyersCount: 14,
      description: "Pioneer fabrication and tooling district famous for custom pressure vessels, cement machinery, and toolroom die block operations.",
      tags: ["Heavy Fabrication", "Pressure Vessels", "Tooling"]
    },
    {
      id: "cluster_ranjangaon",
      name: "Ranjangaon 5-Star Industrial Zone",
      region: "Pune-Ahmednagar Highway",
      state: "Maharashtra",
      country: "India",
      coordinates: { lat: 18.7758, lng: 74.2412 },
      establishedYear: 2001,
      primaryIndustries: ["Home Appliances & White Goods", "Automotive Glass & Stamping", "Secondary Packaging"],
      keyMaterialsGenerated: ["Sheet-metal offcuts", "Polyurethane foam scrap", "Corrugated packaging waste"],
      keyMaterialsDemanded: ["Stainless steel 430", "Prepainted galvanized steel", "Polypropylene granules"],
      estimatedCompaniesCount: 480,
      activeListingsCount: 5,
      activeBuyersCount: 7,
      description: "Five-star integrated manufacturing hub housing global appliance OEMs, automotive stamping, and consumer durables assembly.",
      tags: ["White Goods", "Appliance Stamping", "Packaging"]
    },
    {
      id: "cluster_peenya",
      name: "Peenya Industrial Area",
      region: "Bengaluru North",
      state: "Karnataka",
      country: "India",
      coordinates: { lat: 13.0285, lng: 77.5197 },
      establishedYear: 1970,
      primaryIndustries: ["Aerospace Component CNC Machining", "Precision Instruments", "Defence Electronics"],
      keyMaterialsGenerated: ["Aluminium 6061/7075 billet cuts", "Brass turnings", "Titanium swarf"],
      keyMaterialsDemanded: ["Aerospace grade billet stock", "Free-cutting brass rods"],
      estimatedCompaniesCount: 3500,
      activeListingsCount: 14,
      activeBuyersCount: 19,
      description: "One of Southeast Asia's oldest precision manufacturing clusters with AS9100 certified aerospace machining facilities supplying aircraft components.",
      tags: ["Aerospace CNC", "Aluminium Billets", "Precision Instruments"]
    },
    {
      id: "cluster_sriperumbudur",
      name: "Sriperumbudur Industrial Corridor",
      region: "Chennai West",
      state: "Tamil Nadu",
      country: "India",
      coordinates: { lat: 12.9698, lng: 79.9482 },
      establishedYear: 1999,
      primaryIndustries: ["Automotive Stamping", "Medical Enclosures", "Consumer Electronics"],
      keyMaterialsGenerated: ["Stainless steel 304/316 sheet offcuts", "Laser skeletons", "Copper stamping punch-outs"],
      keyMaterialsDemanded: ["SS304 coils", "High conductivity copper sheet"],
      estimatedCompaniesCount: 1200,
      activeListingsCount: 11,
      activeBuyersCount: 13,
      description: "High-volume sheet-metal fabrication and laser stamping hub with direct access to Chennai port corridors.",
      tags: ["Stainless Steel", "Laser Stamping", "Electronics Enclosures"]
    },
    {
      id: "cluster_faridabad",
      name: "Sector 58 Secondary Alloys & Foundry Zone",
      region: "Delhi-NCR Industrial Belt",
      state: "Haryana",
      country: "India",
      coordinates: { lat: 28.3412, lng: 77.3325 },
      establishedYear: 1982,
      primaryIndustries: ["Secondary Aluminium Smelting", "Brass Ingot Foundry", "Induction Melting"],
      keyMaterialsGenerated: ["Foundry dross", "Slag residue", "Sintered fines"],
      keyMaterialsDemanded: ["Clean aluminium scrap", "Forged EN8 flash", "Brass turnings"],
      estimatedCompaniesCount: 950,
      activeListingsCount: 8,
      activeBuyersCount: 22,
      description: "Major secondary metal reclamation and smelting center with continuous induction furnaces producing certified alloy ingots.",
      tags: ["Secondary Smelting", "Foundry Ingots", "Induction Furnaces"]
    }
  ],

  auditLogs: [
    {
      id: "log_1",
      userId: "user_seller_anand",
      action: "LISTING_PUBLISHED",
      details: "Published Aerospace Grade 6061-T6 Aluminum Billet Cut-offs (2480 kg)",
      timestamp: "2026-10-20T10:30:00Z"
    },
    {
      id: "log_2",
      userId: "user_buyer_rajesh",
      action: "DISCLOSURE_REQUESTED",
      details: "Requested contact reveal for AeroSheet Fabtech Works regarding SS304 laser offcuts",
      timestamp: "2026-10-23T14:20:00Z"
    },
    {
      id: "log_3",
      userId: "user_buyer_rajesh",
      action: "PAYMENT_CONFIRMED",
      details: "Payment confirmed for Order ord_2026_001. Generated Invoice INV-2026-8801.",
      timestamp: "2026-10-23T16:15:00Z"
    }
  ],
  notifications: []
};

// Singleton in-memory cache synchronized with disk
let cachedDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      cachedDb = JSON.parse(JSON.stringify(INITIAL_DATA));
      return cachedDb!;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    cachedDb = JSON.parse(data);

    // Ensure newly added schema arrays exist if reading from previous file
    if (!cachedDb!.orders) cachedDb!.orders = INITIAL_DATA.orders;
    if (!cachedDb!.orderItems) cachedDb!.orderItems = INITIAL_DATA.orderItems;
    if (!cachedDb!.payments) cachedDb!.payments = INITIAL_DATA.payments;
    if (!cachedDb!.invoices) cachedDb!.invoices = INITIAL_DATA.invoices;
    if (!cachedDb!.industrialClusters) cachedDb!.industrialClusters = INITIAL_DATA.industrialClusters;
    INITIAL_DATA.companies.forEach((comp) => {
      if (!cachedDb!.companies.some((c) => c.id === comp.id)) {
        cachedDb!.companies.push(comp);
      }
    });
    INITIAL_DATA.shipments.forEach((ship) => {
      if (!cachedDb!.shipments.some((s) => s.id === ship.id)) {
        cachedDb!.shipments.push(ship);
      }
    });
    if (!cachedDb!.supplierInvoices || cachedDb!.supplierInvoices.length === 0) {
      cachedDb!.supplierInvoices = INITIAL_DATA.supplierInvoices;
    }
    if (!cachedDb!.notifications) {
      cachedDb!.notifications = [];
    }

    return cachedDb!;
  } catch (error) {
    console.error("Error loading database file, falling back to initial data:", error);
    cachedDb = JSON.parse(JSON.stringify(INITIAL_DATA));
    return cachedDb!;
  }
}

export function saveDatabase(db: DatabaseSchema): void {
  try {
    cachedDb = db;
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to persist database file to disk:", error);
  }
}
