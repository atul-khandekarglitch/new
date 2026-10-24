"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { MaterialListing, CompatibilityResult } from "@/types";
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  Layers, 
  FileText, 
  DollarSign, 
  Calendar, 
  Scale, 
  Info, 
  Eye, 
  Share2, 
  Building2, 
  Lock, 
  Send, 
  Calculator, 
  Check, 
  X,
  Maximize2
} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const { user, company } = useAuth();

  const [listing, setListing] = useState<MaterialListing | null>(null);
  const [supplierCompany, setSupplierCompany] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Forms
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState<"enquiry" | "offer">("enquiry");
  const [offeredPrice, setOfferedPrice] = useState<number>(0);
  const [offeredQty, setOfferedQty] = useState<number>(0);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Disclosure Request state
  const [disclosureModalOpen, setDisclosureModalOpen] = useState(false);
  const [disclosureJustification, setDisclosureJustification] = useState("");
  const [disclosureSuccess, setDisclosureSuccess] = useState(false);

  // Cost calculator state (Section 40)
  const [calcDistanceKm, setCalcDistanceKm] = useState(320);
  const [calcTransportRate, setCalcTransportRate] = useState(35);
  const [calcProcessingCost, setCalcProcessingCost] = useState(5);
  const [calcQuantity, setCalcQuantity] = useState(1000);

  // Active compatibility match
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/listings/${listingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setListing(data.listing);
          setSupplierCompany(data.supplierCompany);
          setOfferedPrice(data.listing.pricePerUnit);
          setOfferedQty(data.listing.minOrderQuantity || 100);
          setCalcQuantity(data.listing.minOrderQuantity || 1000);

          if (data.compatibilityMatches && data.compatibilityMatches.length > 0) {
            setCompatibility(data.compatibilityMatches[0].evaluation);
          }
        } else {
          setError(data.error || "Failed to load listing");
        }
      })
      .catch((err) => {
        console.error("Listing load error:", err);
        setError("Error connecting to server");
      })
      .finally(() => setIsLoading(false));
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Loading technical specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
          <p className="text-sm text-slate-600">{error || "This material listing does not exist."}</p>
          <Link href="/marketplace" className="inline-block px-4 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Cost calculation on the fly
  const materialSubtotal = calcQuantity * listing.pricePerUnit;
  const freightTotal = Math.round(calcDistanceKm * calcTransportRate);
  const handlingLoading = Math.round(calcQuantity * 2.5);
  const processingTotal = Math.round(calcQuantity * calcProcessingCost);
  const testingFee = listing.testReportAvailable ? 0 : 3500;
  const subtotalDelivered = materialSubtotal + freightTotal + handlingLoading + processingTotal + testingFee;
  const deliveredTaxes = Math.round(subtotalDelivered * 0.18);
  const totalDeliveredCost = subtotalDelivered + deliveredTaxes;
  const landedPerUnit = Number((totalDeliveredCost / (calcQuantity || 1)).toFixed(2));
  const virginBaseline = Math.round(calcQuantity * (listing.pricePerUnit * 1.55));
  const netSavings = Math.max(0, virginBaseline - totalDeliveredCost);
  const savingsPct = virginBaseline > 0 ? ((netSavings / virginBaseline) * 100).toFixed(1) : "0";

  const handleSendEnquiry = async () => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          listingTitle: listing.title,
          buyerCompanyId: company?.id || "comp_kalyani_fab",
          buyerCompanyName: company?.name || "Verified Industrial Buyer",
          sellerCompanyId: listing.supplierCompanyId,
          sellerCompanyName: supplierCompany?.name,
          type: enquiryType,
          offeredPrice,
          quantity: offeredQty,
          message: enquiryMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquirySuccess(true);
        setTimeout(() => {
          setEnquirySuccess(false);
          setEnquiryModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Enquiry failed:", err);
    }
  };

  const handleRequestDisclosure = async () => {
    try {
      const res = await fetch("/api/disclosure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          listingTitle: listing.title,
          requesterCompanyId: company?.id || "comp_kalyani_fab",
          requesterCompanyName: company?.name || "Kalyani Industrial Equipment",
          targetCompanyId: listing.supplierCompanyId,
          targetCompanyName: supplierCompany?.name,
          requestType: "contact_info",
          justification: disclosureJustification || "Verified procurement request for manufacturing intake.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDisclosureSuccess(true);
        setTimeout(() => {
          setDisclosureSuccess(false);
          setDisclosureModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Disclosure request failed:", err);
    }
  };

  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="defaultBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%230265ff"/></linearGradient></defs><rect width="600" height="400" fill="url(%23defaultBg)"/><circle cx="300" cy="180" r="70" fill="none" stroke="url(%23accentG)" stroke-width="4" stroke-dasharray="10 8"/><path d="M 270,180 L 330,180 M 300,150 L 300,210" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><text x="300" y="300" fill="%23e2e8f0" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">INDUSCYCLE CERTIFIED MATERIAL</text><text x="300" y="330" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Physical Sample Pending Supplier Photo Upload</text></svg>`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">ID: {listing.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {listing.viewsCount} views
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Top Section: Gallery & Primary Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Gallery Viewport (Col 1-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative h-96 w-full rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden shadow-md flex items-center justify-center">
              <img
                src={
                  listing.images && listing.images.length > 0
                    ? listing.images[activeImageIndex]?.storagePath || listing.images[0].storagePath
                    : fallbackImage
                }
                alt={listing.title}
                className="w-full h-full object-contain"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {listing.verificationState === "verified" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-lg flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Mill Test Report (MTR)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white shadow-lg">
                    Declared Specifications
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? "border-brand-blue scale-105 shadow-md" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.storagePath} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Buy / Action Box (Col 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-5">
              
              <div>
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                  {listing.materialCategory}
                </span>
                <h1 className="text-2xl font-black text-navy-950 mt-1 leading-snug">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{listing.industrialArea}, {listing.city}, {listing.state}</span>
                </div>
              </div>

              {/* Price & Quantity Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Price per unit</span>
                    <div className="text-3xl font-black text-brand-blue">
                      ₹{listing.pricePerUnit}
                      <span className="text-sm font-normal text-slate-500 ml-1">/ {listing.quantityUnit}</span>
                    </div>
                  </div>
                  {listing.negotiable && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-brand-blue">
                      Negotiable
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block">Available Stock:</span>
                    <span className="font-bold text-slate-900">{listing.totalQuantity.toLocaleString()} {listing.quantityUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Minimum Order:</span>
                    <span className="font-bold text-slate-900">{listing.minOrderQuantity} {listing.quantityUnit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs flex justify-between items-center text-slate-600">
                  <span>Indicative Lot Value:</span>
                  <span className="font-bold text-slate-900">
                    ₹{(listing.totalQuantity * listing.pricePerUnit).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Link
                  href={`/checkout/${listing.id}`}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Instant Procurement &amp; Checkout</span>
                </Link>

                <button
                  onClick={() => {
                    setEnquiryType("offer");
                    setEnquiryModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Make a Purchase Offer</span>
                </button>

                <button
                  onClick={() => {
                    setEnquiryType("enquiry");
                    setEnquiryModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-slate-500" />
                  <span>Send Technical RFQ / Inquiry</span>
                </button>

                {/* Privacy reveal button */}
                {supplierCompany?.isPrivate && (
                  <button
                    onClick={() => setDisclosureModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Supplier Identity &amp; Plant Access</span>
                  </button>
                )}
              </div>

              {/* Supplier Identity Summary (Privacy-Preserving) */}
              <div className="pt-3 border-t border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                    {supplierCompany?.name || "Verified Industrial Plant"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Industry:</span>
                  <span className="text-slate-700">{supplierCompany?.industry || "Manufacturing"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Logistics Mode:</span>
                  <span className="text-slate-700 capitalize">{listing.pickupDeliveryPreference.replace("_", " ")}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Section: Material Compatibility Checker (Section 38 & 39) */}
        {compatibility && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-navy-950 to-navy-900 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Section 38 • Material Compatibility Engine
                </span>
                <h2 className="text-lg font-bold mt-0.5 flex items-center gap-2">
                  <span>Compatibility Status:</span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    compatibility.status === "Compatible" 
                      ? "bg-emerald-500 text-white" 
                      : compatibility.status === "Potentially Compatible" 
                      ? "bg-amber-500 text-slate-950" 
                      : "bg-rose-500 text-white"
                  }`}>
                    {compatibility.status}
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-cyan-300">{compatibility.score} / 100</div>
                <div className="text-[10px] text-slate-300 uppercase">Decision-Support Score</div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Why this match explanation (Section 39) */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-sm text-brand-blue">
                  <Info className="w-4 h-4" />
                  <span>Why this match?</span>
                </div>
                <p className="leading-relaxed text-slate-700">{compatibility.explanation}</p>
              </div>

              {/* Breakdown Grid: Matched vs Conflicts vs Missing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Matched Fields */}
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Specifications ({compatibility.matchedFields.length})</span>
                  </div>
                  <div className="space-y-2">
                    {compatibility.matchedFields.map((f, i) => (
                      <div key={i} className="p-2 rounded bg-white border border-emerald-100">
                        <span className="font-semibold text-slate-900 block">{f.label}: {f.value}</span>
                        <span className="text-[11px] text-slate-500">{f.matchDetail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflicting Fields */}
                <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-2">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-600" />
                    <span>Conflicting Fields ({compatibility.conflictingFields.length})</span>
                  </div>
                  {compatibility.conflictingFields.length === 0 ? (
                    <div className="p-3 text-slate-500 italic">No conflicting metallurgy detected.</div>
                  ) : (
                    compatibility.conflictingFields.map((c, i) => (
                      <div key={i} className="p-2 rounded bg-white border border-rose-100">
                        <span className="font-semibold text-rose-900 block">{c.label}</span>
                        <span className="text-[11px] text-slate-600 block">Buyer: {c.buyerReq} | Surplus: {c.listingValue}</span>
                        <span className="text-[10px] text-rose-600">{c.reason}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Missing & Recommendations */}
                <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Missing / Requires Confirmation</span>
                  </div>
                  {compatibility.missingFields.length === 0 ? (
                    <div className="p-3 text-slate-500 italic">Full documentation attached.</div>
                  ) : (
                    compatibility.missingFields.map((m, i) => (
                      <div key={i} className="p-2 rounded bg-white border border-amber-100">
                        <span className="font-semibold text-amber-900 block">{m.label}</span>
                        <span className="text-[11px] text-slate-600">{m.recommendation}</span>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Section: Complete Technical Specifications & Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Metallurgy & Physical Specifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-blue" />
              <span>Material Metallurgy &amp; Origin</span>
            </h3>

            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Material Grade</span>
                <span className="text-sm font-bold text-slate-900">{listing.grade}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Alloy Designation</span>
                <span className="text-sm font-bold text-slate-900">{listing.alloyDesignation || "Declared Commercial"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-semibold">Chemical Composition</span>
                <span className="text-slate-700 font-mono text-[11px] bg-slate-50 p-2 rounded block border border-slate-100">
                  {listing.chemicalComposition || "Not specified by supplier"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Standard Reference</span>
                <span className="text-slate-800">{listing.standardSpec || "IS / ASTM equivalent"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Hardness</span>
                <span className="text-slate-800">{listing.hardness || "As forged / as cut"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Source Industry</span>
                <span className="text-slate-800">{listing.sourceIndustry}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Manufacturing Process</span>
                <span className="text-slate-800">{listing.manufacturingProcess}</span>
              </div>
            </div>
          </div>

          {/* Dedicated Dimensions Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-blue" />
              <span>Physical Dimensions &amp; Geometry</span>
            </h3>

            <div className="grid grid-cols-2 gap-y-3 text-xs">
              {listing.dimensions.length && (
                <div>
                  <span className="text-slate-400 block font-semibold">Length</span>
                  <span className="text-sm font-bold text-slate-900">
                    {listing.dimensions.length} {listing.dimensions.dimensionUnit}
                  </span>
                </div>
              )}
              {listing.dimensions.width && (
                <div>
                  <span className="text-slate-400 block font-semibold">Width</span>
                  <span className="text-sm font-bold text-slate-900">
                    {listing.dimensions.width} {listing.dimensions.dimensionUnit}
                  </span>
                </div>
              )}
              {listing.dimensions.heightOrThickness && (
                <div>
                  <span className="text-slate-400 block font-semibold">Height / Thickness</span>
                  <span className="text-sm font-bold text-slate-900">
                    {listing.dimensions.heightOrThickness} {listing.dimensions.dimensionUnit}
                  </span>
                </div>
              )}
              {listing.dimensions.diameter && (
                <div>
                  <span className="text-slate-400 block font-semibold">Diameter</span>
                  <span className="text-sm font-bold text-slate-900">
                    Ø {listing.dimensions.diameter} {listing.dimensions.dimensionUnit}
                  </span>
                </div>
              )}
              {listing.dimensions.particleOrChipSize && (
                <div className="col-span-2">
                  <span className="text-slate-400 block font-semibold">Particle / Chip Size</span>
                  <span className="text-slate-800">{listing.dimensions.particleOrChipSize}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block font-semibold">Physical Form</span>
                <span className="text-slate-800">{listing.dimensions.shapeOrPhysicalForm || "Solid piece"}</span>
              </div>
              {listing.dimensions.weightPerPiece && (
                <div>
                  <span className="text-slate-400 block font-semibold">Weight per Piece</span>
                  <span className="text-slate-800">{listing.dimensions.weightPerPiece} kg</span>
                </div>
              )}
              {listing.dimensions.numberOfPieces && (
                <div>
                  <span className="text-slate-400 block font-semibold">Estimated Pieces</span>
                  <span className="text-slate-800">{listing.dimensions.numberOfPieces.toLocaleString()} pcs</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Dimensional unit: <strong className="text-slate-700">{listing.dimensions.dimensionUnit}</strong>
            </div>
          </div>

        </div>

        {/* Section: Quality, Condition & Supporting Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quality & Condition */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Quality, Condition &amp; Safety</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Surface Cleanliness:</span>
                <span className="font-bold text-slate-800 capitalize">{listing.condition}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Contamination Status:</span>
                <span className="text-slate-700">{listing.contaminationStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Residual Coolant / Oil:</span>
                <span className={listing.residualOilCoolant ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                  {listing.residualOilCoolant ? "Present" : "None / Dry"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Rust / Oxidation:</span>
                <span className={listing.rustOxidation ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                  {listing.rustOxidation ? "Light Surface Oxidation" : "Clean / Non-oxidized"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Inspection Status:</span>
                <span className="text-slate-700 capitalize">{listing.inspectionStatus.replace("_", " ")}</span>
              </div>
              {listing.requiredProcessingBeforeReuse && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mt-2">
                  <span className="font-semibold text-slate-700 block mb-0.5">Required Processing:</span>
                  <span className="text-slate-600">{listing.requiredProcessingBeforeReuse}</span>
                </div>
              )}
            </div>
          </div>

          {/* Supporting Documents (Section 2.H) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span>Technical Documents &amp; Certificates</span>
            </h3>

            {listing.documents && listing.documents.length > 0 ? (
              <div className="space-y-3">
                {listing.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-brand-blue shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          Type: {doc.documentType.replace("_", " ")} • {doc.fileSize || "1.2 MB"}
                        </div>
                      </div>
                    </div>
                    <div>
                      {doc.verificationState === "verified" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          Awaiting Review
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No external documents uploaded yet.
              </div>
            )}
          </div>

        </div>

        {/* Section: Transport and Processing Cost Estimator (Section 40) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Section 40 • Delivered Cost Estimator
              </span>
              <h3 className="text-xl font-bold text-navy-950 mt-0.5">
                Calculate Total Landed Cost per Usable Unit
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Baseline vs Landed Savings:</span>
              <span className="text-xl font-black text-emerald-600">
                ₹{netSavings.toLocaleString()} ({savingsPct}% Saved)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input Sliders */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Procurement Quantity: <strong className="text-brand-blue">{calcQuantity} {listing.quantityUnit}</strong>
                </label>
                <input
                  type="range"
                  min={listing.minOrderQuantity || 100}
                  max={listing.totalQuantity}
                  step={50}
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Haulage Distance: <strong className="text-brand-blue">{calcDistanceKm} km</strong>
                </label>
                <input
                  type="range"
                  min={20}
                  max={1800}
                  step={20}
                  value={calcDistanceKm}
                  onChange={(e) => setCalcDistanceKm(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pre-Processing / Cleaning: <strong className="text-brand-blue">₹{calcProcessingCost} / {listing.quantityUnit}</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={35}
                  step={1}
                  value={calcProcessingCost}
                  onChange={(e) => setCalcProcessingCost(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200">
                Cost Breakdown (Documented Data Sources)
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Material Cost ({calcQuantity} {listing.quantityUnit}):</span>
                <span className="font-semibold text-slate-900">₹{materialSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freight ({calcDistanceKm} km @ ₹{calcTransportRate}/km):</span>
                <span className="font-semibold text-slate-900">₹{freightTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Forklift Loading &amp; Strapping:</span>
                <span className="font-semibold text-slate-900">₹{handlingLoading.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Degreasing / Cutting Preparation:</span>
                <span className="font-semibold text-slate-900">₹{processingTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applicable GST / Taxes (18%):</span>
                <span className="font-semibold text-slate-900">₹{deliveredTaxes.toLocaleString()}</span>
              </div>
            </div>

            {/* Final Landed Cost Box */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-900 to-navy-950 text-white flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">Total Delivered Landed Cost</span>
                <div className="text-3xl font-black text-white mt-1">₹{totalDeliveredCost.toLocaleString()}</div>
                <div className="text-xs text-slate-300 mt-1">Effective landed rate: <strong className="text-cyan-300">₹{landedPerUnit} / {listing.quantityUnit}</strong></div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Virgin Sourcing Equivalent:</span>
                  <span className="line-through">₹{virginBaseline.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 mt-0.5">
                  <span>Net Commercial Benefit:</span>
                  <span>+₹{netSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* =========================================================================
          Enquiry / Offer Modal
         ========================================================================= */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">
                {enquiryType === "offer" ? "Submit Commercial Offer" : "Send Technical RFQ Inquiry"}
              </h3>
              <button onClick={() => setEnquiryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {enquirySuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">Message Dispatched!</h4>
                <p className="text-xs text-slate-500">Your proposal was delivered directly to the seller plant coordinator.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Target Material:</span>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-bold text-slate-900">
                    {listing.title}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Offered Price (₹ / {listing.quantityUnit})</label>
                    <input
                      type="number"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Required Quantity ({listing.quantityUnit})</label>
                    <input
                      type="number"
                      value={offeredQty}
                      onChange={(e) => setOfferedQty(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Message / Quality Conditions</label>
                  <textarea
                    rows={3}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Specify target intake date, packaging preference, or test verification requirements..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEnquiryModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEnquiry}
                    className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold shadow-md"
                  >
                    Send to Supplier
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          Disclosure Request Modal (Section 43)
         ========================================================================= */}
      {disclosureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>Request Supplier Disclosure</span>
              </h3>
              <button onClick={() => setDisclosureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {disclosureSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">Request Logged</h4>
                <p className="text-xs text-slate-500">
                  The supplier has been notified and will approve plant address and direct logistics access upon review.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  This supplier operates under Induscycle&apos;s privacy-preserving protocol. State your commercial purpose and manufacturing requirements to request explicit disclosure of their legal entity, precise factory address, and restricted test reports.
                </p>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Commercial Purpose &amp; Justification *</label>
                  <textarea
                    rows={3}
                    required
                    value={disclosureJustification}
                    onChange={(e) => setDisclosureJustification(e.target.value)}
                    placeholder="e.g. We require direct factory pickup for 2,000 kg 6061 billet cuts and wish to verify AS9100 batch tags."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDisclosureModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestDisclosure}
                    className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
                  >
                    Submit Disclosure Request
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
