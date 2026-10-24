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
