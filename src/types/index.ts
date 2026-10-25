export type UserRole = 'buyer' | 'seller' | 'both' | 'admin';

export type PrivacyLevel = 'public' | 'matched_only' | 'approval_required';

export type VerificationState = 'draft' | 'uploaded' | 'awaiting_review' | 'verified' | 'rejected' | 'expired';

export type MaterialCategory =
  | 'Mild steel and carbon steel'
  | 'Stainless steel'
  | 'Alloy steel'
  | 'Aluminium'
  | 'Copper and brass'
  | 'Cast iron'
  | 'CNC machining chips and turnings'
  | 'Forging flash'
  | 'Billet cut-offs'
  | 'Sheet-metal offcuts'
  | 'Casting runners and gates'
  | 'Tool steel and carbide scrap'
  | 'Plastic production scrap'
  | 'Packaging materials'
  | 'Other industrial by-products';

export interface Company {
  id: string;
  name: string;
  industry: string;
  subIndustry?: string;
  manufacturingProcess?: string;
  city: string;
  state: string;
  country: string;
  industrialArea: string;
  privacyLevel: PrivacyLevel;
  verified: boolean;
  contactEmail: string;
  contactPhone?: string;
  capabilities: string[];
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyId: string;
  avatar?: string;
  createdAt: string;
}

export interface MaterialDimensions {
  length?: number;
  width?: number;
  heightOrThickness?: number;
  diameter?: number;
  wallThickness?: number;
  particleOrChipSize?: string;
  shapeOrPhysicalForm?: string;
  dimensionUnit: 'mm' | 'cm' | 'inches' | 'm';
  weightPerPiece?: number;
  numberOfPieces?: number;
}

export interface ListingImage {
  id: string;
  listingId: string;
  storagePath: string; // base64 or URL
  originalFilename: string;
  contentType: string;
  fileSize: number;
  isPrimary: boolean;
  displayOrder: number;
  uploadedAt: string;
}

export interface ListingDocument {
  id: string;
  listingId: string;
  title: string;
  documentType: 'test_report' | 'composition_cert' | 'inspection_report' | 'weighbridge_receipt' | 'safety_sheet' | 'other';
  storagePath: string;
  verificationState: 'uploaded' | 'awaiting_review' | 'verified' | 'rejected' | 'expired';
  reviewerId?: string;
  reviewerName?: string;
  reviewTimestamp?: string;
  expiryDate?: string;
  isConfidential: boolean;
  fileSize?: string;
}

export interface MaterialListing {
  id: string;
  supplierCompanyId: string;
  supplierUserId: string;
  title: string;
  materialName: string;
  materialCategory: MaterialCategory;
  sourceIndustry: string;
  manufacturingProcess: string;
  description: string;
  listingType: 'sale' | 'reuse' | 'recycling' | 'exchange' | 'donation';
  intendedReuse?: string;
  
  // Specifications
  grade: string;
  alloyDesignation?: string;
  chemicalComposition?: string;
  standardSpec?: string;
  hardness?: string;
  testReportAvailable: boolean;
  compositionCertAvailable: boolean;
  specDeclaredOrVerified: 'declared' | 'verified';

  // Dimensions
  dimensions: MaterialDimensions;

  // Quantity and Pricing
  totalQuantity: number;
  quantityUnit: 'kg' | 'tonnes' | 'pieces' | 'meters';
  minOrderQuantity: number;
  pricePerUnit: number;
  currency: string;
  negotiable: boolean;
  availableImmediately: boolean;
  availabilityStartDate?: string;
  expiryDate?: string;
  recurringSupply: boolean;
  expectedMonthlyQuantity?: number;
  storageLoadingConstraints?: string;

  // Quality & Condition
  condition: 'clean' | 'mixed' | 'oily' | 'wet' | 'oxidised' | 'damaged' | 'other';
  contaminationStatus: string;
  residualOilCoolant: boolean;
  rustOxidation: boolean;
  mixedGradeStatus: boolean;
  sortingRequirements?: string;
  cleaningProcessingReqs?: string;
  inspectionStatus: 'uninspected' | 'self_inspected' | 'third_party_inspected';
  qualityNotes?: string;
  handlingRequirements?: string;
  safetyInformation?: string;
  requiredProcessingBeforeReuse?: string;

  // Location
  country: string;
  state: string;
  city: string;
  industrialArea: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  pickupDeliveryPreference: 'pickup_only' | 'delivery_included' | 'negotiable';
  vehicleRestrictions?: string;
  estimatedLoadingTime?: string;

  // State
  verificationState: 'draft' | 'pending_verification' | 'verified' | 'rejected' | 'archived';
  status: 'active' | 'reserved' | 'sold' | 'draft' | 'archived';
  viewsCount: number;
  enquiriesCount: number;

  images: ListingImage[];
  documents: ListingDocument[];

  createdAt: string;
  updatedAt: string;
}

export interface BuyerRequirement {
  id: string;
  buyerCompanyId: string;
  buyerUserId: string;
  title: string;
  materialCategory: MaterialCategory;
  requiredGrade: string;
  targetDimensions?: string;
  quantityRequired: number;
  quantityUnit: 'kg' | 'tonnes' | 'pieces' | 'meters';
  maxBudgetPerUnit: number;
  currency: string;
  conditionAcceptable: string[];
  requiredCertifications: string[];
  destinationCity: string;
  destinationState: string;
  destinationIndustrialArea?: string;
  targetDate: string;
  isPrivate: boolean;
  status: 'active' | 'matched' | 'fulfilled';
  createdAt: string;
}

export type CompatibilityStatus = 'Compatible' | 'Potentially Compatible' | 'Incompatible' | 'Insufficient Information';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  score: number; // 0 to 100 estimated decision-support score
  matchedFields: { label: string; value: string; matchDetail: string }[];
  conflictingFields: { label: string; buyerReq: string; listingValue: string; reason: string }[];
  missingFields: { label: string; importance: 'critical' | 'moderate' | 'low'; recommendation: string }[];
  explanation: string;
  actionableRecommendations: string[];
}

export interface TransportCalculationInput {
  quantity: number;
  unit: string;
  materialPricePerUnit: number;
  origin: string;
  destination: string;
  distanceKm: number;
  transportMethod: 'Road (Flatbed)' | 'Road (Covered Truck)' | 'Road (Tipper)' | 'Rail' | 'Multimodal';
  transportRatePerKm: number;
  loadingUnloadingRate: number;
  packagingHandling: number;
  sortingCleaning: number;
  cuttingSizeReduction: number;
  meltingProcessing: number;
  testingCertification: number;
  applicableTaxesPercent: number;
}

export interface TransportCalculationResult {
  materialCost: number;
  transportEstimate: number;
  loadingUnloadingCost: number;
  packagingCost: number;
  processingCost: number;
  testingCost: number;
  subtotal: number;
  taxes: number;
  totalDeliveredCost: number;
  costPerUsableUnit: number;
  baselineCost: number;
  estimatedSavings: number;
  savingsPercentage: number;
  isEstimate: boolean;
}

export type ShipmentStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ShipmentEvent {
  stage: ShipmentStageNumber;
  stageName: string;
  timestamp: string;
  location: string;
  description: string;
  completed: boolean;
  operator?: string;
  source?: 'Simulated GPS' | 'Operator Verification' | 'Weighbridge Automated Scan';
}

export interface ShipmentGPSStatus {
  simulatedSpeedKmh: number;
  latitude: number;
  longitude: number;
  routeProgressPercent: number;
  lastPingTimestamp: string;
  transponderStatus: 'ACTIVE_ONLINE' | 'STANDBY' | 'SIGNAL_LOST';
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  eWayBillNumber: string;
  estimatedArrivalTimestamp: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  exchangeId: string;
  listingId: string;
  listingTitle: string;
  buyerCompanyId: string;
  buyerCompanyName: string;
  supplierCompanyId: string;
  supplierCompanyName: string;
  carrierName: string;
  vehicleNumber?: string;
  driverContact?: string;
  origin: string;
  destination: string;
  distanceKm: number;
  currentStage: ShipmentStageNumber;
  expectedCollectionDate: string;
  expectedDeliveryDate: string;
  actualCollectionDate?: string;
  actualDeliveryDate?: string;
  isDemoTracking: boolean;
  currentCoordinates?: { lat: number; lng: number };
  gpsStatus?: ShipmentGPSStatus;
  timeline: ShipmentEvent[];
  proofOfCollectionDoc?: string;
  proofOfDeliveryDoc?: string;
  receiptQuantityConfirmed?: number;
  receiptConditionConfirmed?: 'accepted_good' | 'accepted_with_discrepancy' | 'rejected';
  issueReported?: string;
}

export interface WhatIfBuyerScenario {
  name: string;
  requiredQuantity: number;
  supplierMaterialPrice: number;
  conventionalSourcingCostPerUnit: number;
  transportCost: number;
  handlingCost: number;
  processingCost: number;
  expectedUsableYieldPercent: number;
  additionalFees: number;
}

export interface WhatIfSellerScenario {
  name: string;
  availableQuantity: number;
  proposedSellingPricePerUnit: number;
  collectionAndHandlingPaidBySeller: number;
  processingPreparationCosts: number;
  platformFeesPercent: number;
  expectedUnsoldOrRejectedPercent: number;
}

export interface DisclosureRequest {
  id: string;
  requesterCompanyId: string;
  requesterCompanyName: string;
  targetCompanyId: string;
  targetCompanyName: string;
  listingId: string;
  listingTitle: string;
  requestType: 'contact_info' | 'restricted_document';
  documentTitle?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  justification: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  query: string;
  category?: string;
  location?: string;
  notifyOnMatch: boolean;
  createdAt: string;
}

export interface EnquiryOffer {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerCompanyId: string;
  buyerCompanyName: string;
  sellerCompanyId: string;
  sellerCompanyName: string;
  type: 'enquiry' | 'offer';
  offeredPrice: number;
  quantity: number;
  message: string;
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  createdAt: string;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  materialName: string;
  materialCategory: string;
  grade: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCompanyName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerAddress?: string;
  sellerId: string;
  sellerCompanyName: string;
  sellerEmail: string;
  sellerCity: string;
  sellerState: string;
  listingId: string;
  status: OrderStatus;
  subtotal: number;
  transportCost: number;
  processingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  invoiceId?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: 'razorpay' | 'stripe' | 'wire_transfer' | 'demo_gateway';
  providerPaymentReference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  isTestMode: boolean;
  confirmedAt?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  sellerDetails: {
    companyName: string;
    city: string;
    state: string;
    country: string;
    industrialArea?: string;
    email: string;
    phone?: string;
  };
  buyerDetails: {
    fullName: string;
    companyName: string;
    email: string;
    phone?: string;
    city: string;
    state: string;
  };
  materialDetails: {
    listingId: string;
    materialName: string;
    grade: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  };
  subtotal: number;
  transportCost: number;
  processingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'paid' | 'pending';
  paymentReference: string;
  paymentMethod: string;
  storagePath?: string;
  createdAt: string;
}

export interface IndustrialCluster {
  id: string;
  name: string;
  region: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  establishedYear?: number;
  primaryIndustries: string[];
  keyMaterialsGenerated: string[];
  keyMaterialsDemanded: string[];
  estimatedCompaniesCount: number;
  activeListingsCount: number;
  activeBuyersCount: number;
  description: string;
  tags: string[];
}

// Supplier Payments & Milestone Tracking
export type InvoiceApprovalStatus = 
  | 'Draft' 
  | 'Pending Review' 
  | 'Under Review' 
  | 'Approved' 
  | 'Rejected' 
  | 'Needs Clarification';

export type InvoicePaymentStatus = 
  | 'Not Due' 
  | 'Pending Payment' 
  | 'Partially Paid' 
  | 'Paid' 
  | 'Overdue';

export type EligibilityStatus = 
  | 'Eligible' 
  | 'Blocked' 
  | 'Pending evidence' 
  | 'Needs review';

export interface PaymentMilestone {
  id: string;
  name: string; // e.g. 'Advance (20%)', 'Dispatch (30%)', 'Delivery (30%)', 'Quality Inspection (20%)'
  percentage: number;
  amount: number;
  condition: string;
  status: 'pending' | 'verified' | 'paid' | 'blocked';
  verificationSource?: string;
  verifiedAt?: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  transactionReference: string; // e.g. DEMO-TXN-2026-9912
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  processedBy: string;
  note?: string;
  status: 'success' | 'pending' | 'failed';
}

export interface ThreeWayMatch {
  matched: boolean;
  poNumber: string;
  poQuantity: number;
  poUnitRate: number;
  poTotal: number;
  invoiceQuantity: number;
  invoiceUnitRate: number;
  invoiceTotal: number;
  grnNumber: string;
  grnQuantity: number;
  grnCondition: string;
  quantityMatch: boolean;
  unitRateMatch: boolean;
  totalMatch: boolean;
  qualitySignOff: boolean;
  discrepancies: string[];
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  supplierGst?: string;
  buyerName: string;
  buyerCompanyName: string;
  poId: string;
  poNumber: string;
  shipmentId: string;
  trackingNumber: string;
  listingTitle: string;
  materialCategory: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string; // e.g. 'Net 30', 'Milestone (30/40/30)', 'Immediate upon Delivery'
  invoiceAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  currency: string;
  shipmentStatus: string;
  approvalStatus: InvoiceApprovalStatus;
  paymentStatus: InvoicePaymentStatus;
  eligibilityStatus: EligibilityStatus;
  eligibilityReason: string;
  rejectionReason?: string;
  clarificationQuery?: string;
  milestones: PaymentMilestone[];
  threeWayMatch: ThreeWayMatch;
  transactions: PaymentTransaction[];
  scenarioTag: 'Scenario A' | 'Scenario B' | 'Scenario C' | 'Scenario D' | 'Scenario E';
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmailEventType =
  | 'user_registration'
  | 'order_placed'
  | 'order_paid'
  | 'order_status_update'
  | 'shipment_update'
  | 'invoice_approval'
  | 'invoice_rejection'
  | 'invoice_clarification'
  | 'invoice_payment'
  | 'disclosure_request'
  | 'disclosure_status'
  | 'enquiry_offer'
  | 'admin_alert';

export interface EmailNotification {
  id: string;
  idempotencyKey: string;
  to: string;
  from: string;
  subject: string;
  title?: string;
  message?: string;
  link?: string;
  read?: boolean;
  userId?: string;
  eventType: EmailEventType;
  referenceId?: string;
  status: 'sent' | 'failed' | 'simulated_pending_credentials';
  messageId?: string;
  error?: string;
  sentAt: string;
  metadata?: Record<string, any>;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  eventType: EmailEventType;
  referenceId?: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}
