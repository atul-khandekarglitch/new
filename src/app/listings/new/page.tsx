"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { MaterialCategory, ListingImage, ListingDocument } from "@/types";
import { 
  ArrowLeft, 
  Check, 
  Upload, 
  Trash2, 
  Star, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Eye,
  Camera,
  Info
} from "lucide-react";

const CATEGORIES: MaterialCategory[] = [
  "Mild steel and carbon steel",
  "Stainless steel",
  "Alloy steel",
  "Aluminium",
  "Copper and brass",
  "Cast iron",
  "CNC machining chips and turnings",
  "Forging flash",
  "Billet cut-offs",
  "Sheet-metal offcuts",
  "Casting runners and gates",
  "Tool steel and carbide scrap",
  "Plastic production scrap",
  "Packaging materials",
  "Other industrial by-products",
];

const STEPS = [
  { id: 1, name: "Basic Information" },
  { id: 2, name: "Specs & Dimensions" },
  { id: 3, name: "Quantity & Price" },
  { id: 4, name: "Quality & Condition" },
  { id: 5, name: "Photos & Documents" },
  { id: 6, name: "Location & Logistics" },
  { id: 7, name: "Intended Reuse" },
  { id: 8, name: "Review & Publish" },
];

export default function NewListingPage() {
  const router = useRouter();
  const { user, company } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  // 1. Basic
  const [title, setTitle] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialCategory, setMaterialCategory] = useState<MaterialCategory>("Mild steel and carbon steel");
  const [customCategory, setCustomCategory] = useState("");
  const [sourceIndustry, setSourceIndustry] = useState("");
  const [manufacturingProcess, setManufacturingProcess] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"sale" | "reuse" | "recycling" | "exchange" | "donation">("sale");
  const [intendedReuse, setIntendedReuse] = useState("");

  // 2. Dimensions & Metallurgy
  const [grade, setGrade] = useState("");
  const [alloyDesignation, setAlloyDesignation] = useState("");
  const [chemicalComposition, setChemicalComposition] = useState("");
  const [standardSpec, setStandardSpec] = useState("");
  const [hardness, setHardness] = useState("");
  const [dimLength, setDimLength] = useState<number | "">("");
  const [dimWidth, setDimWidth] = useState<number | "">("");
  const [dimHeight, setDimHeight] = useState<number | "">("");
  const [dimDiameter, setDimDiameter] = useState<number | "">("");
  const [dimWallThickness, setDimWallThickness] = useState<number | "">("");
  const [particleSize, setParticleSize] = useState("");
  const [shapeForm, setShapeForm] = useState("");
  const [dimUnit, setDimUnit] = useState<"mm" | "cm" | "inches" | "m">("mm");
  const [weightPerPiece, setWeightPerPiece] = useState<number | "">("");
  const [numberOfPieces, setNumberOfPieces] = useState<number | "">("");
  const [specDeclaredOrVerified, setSpecDeclaredOrVerified] = useState<"declared" | "verified">("declared");

  // 3. Quantity & Price
  const [totalQuantity, setTotalQuantity] = useState<number | "">("");
  const [quantityUnit, setQuantityUnit] = useState<"kg" | "tonnes" | "pieces" | "meters">("kg");
  const [minOrderQuantity, setMinOrderQuantity] = useState<number | "">("");
  const [pricePerUnit, setPricePerUnit] = useState<number | "">("");
  const [currency, setCurrency] = useState("INR");
  const [negotiable, setNegotiable] = useState(true);
  const [availableImmediately, setAvailableImmediately] = useState(true);
  const [availabilityStartDate, setAvailabilityStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [recurringSupply, setRecurringSupply] = useState(false);
  const [expectedMonthlyQuantity, setExpectedMonthlyQuantity] = useState<number | "">("");
  const [storageLoadingConstraints, setStorageLoadingConstraints] = useState("");

  // 4. Quality & Safety
  const [condition, setCondition] = useState<"clean" | "mixed" | "oily" | "wet" | "oxidised" | "damaged" | "other">("clean");
  const [contaminationStatus, setContaminationStatus] = useState("Dry, segregated, non-hazardous");
  const [residualOilCoolant, setResidualOilCoolant] = useState(false);
  const [rustOxidation, setRustOxidation] = useState(false);
  const [mixedGradeStatus, setMixedGradeStatus] = useState(false);
  const [sortingRequirements, setSortingRequirements] = useState("");
  const [cleaningProcessingReqs, setCleaningProcessingReqs] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState<"uninspected" | "self_inspected" | "third_party_inspected">("self_inspected");
  const [qualityNotes, setQualityNotes] = useState("");
  const [handlingRequirements, setHandlingRequirements] = useState("");
  const [safetyInformation, setSafetyInformation] = useState("");
  const [requiredProcessingBeforeReuse, setRequiredProcessingBeforeReuse] = useState("");

  // 5. Photos & Documents
  const [images, setImages] = useState<ListingImage[]>([]);
  const [documents, setDocuments] = useState<ListingDocument[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // 6. Location & Logistics
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Pune");
  const [industrialArea, setIndustrialArea] = useState("Chakan Industrial Corridor");
  const [pickupDeliveryPreference, setPickupDeliveryPreference] = useState<"pickup_only" | "delivery_included" | "negotiable">("pickup_only");
  const [vehicleRestrictions, setVehicleRestrictions] = useState("20ft / 32ft commercial trucks permitted 24x7");
  const [estimatedLoadingTime, setEstimatedLoadingTime] = useState("45 minutes");

  // 7. Intended Reuse
  const [requiresRemelting, setRequiresRemelting] = useState(false);
  const [requiresCutting, setRequiresCutting] = useState(false);
  const [preferredBuyerIndustry, setPreferredBuyerIndustry] = useState("");
  const [reuseRestrictions, setReuseRestrictions] = useState("");

  // Helper calculations
  const indicativeLotValue = (Number(totalQuantity) || 0) * (Number(pricePerUnit) || 0);

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (images.length + e.target.files.length > 8) {
      alert("You can upload a maximum of 8 photographs per material listing.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("files", e.target.files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.items) {
        setImages((prev) => [...prev, ...data.items]);
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Document Upload handler
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingDoc(true);

    const formData = new FormData();
    formData.append("files", e.target.files[0]);
    formData.append("documentType", docType);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.items) {
        setDocuments((prev) => [...prev, ...data.items]);
      } else {
        alert(data.error || "Document upload failed");
      }
    } catch (err) {
      console.error("Doc upload failed:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Validation
    if (!isDraft) {
      if (!title.trim()) {
        setSubmitError("Please enter a listing title.");
        setCurrentStep(1);
        setIsSubmitting(false);
        return;
      }
      if (!totalQuantity || Number(totalQuantity) <= 0) {
        setSubmitError("Quantity must be greater than zero.");
        setCurrentStep(3);
        setIsSubmitting(false);
        return;
      }
      if (!pricePerUnit || Number(pricePerUnit) <= 0) {
        setSubmitError("Please provide an asking price per unit.");
        setCurrentStep(3);
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      isDraft,
      supplierCompanyId: company?.id || "comp_apex_aero",
      supplierUserId: user?.id || "user_seller_anand",
      title: title || "Untitled Draft Listing",
      materialName: materialName || title,
      materialCategory: materialCategory === "Other industrial by-products" && customCategory ? customCategory : materialCategory,
      sourceIndustry,
      manufacturingProcess,
      description,
      listingType,
      intendedReuse: `${intendedReuse}. ${preferredBuyerIndustry ? `Preferred for: ${preferredBuyerIndustry}.` : ""}`,
      grade: grade || "Declared Commercial",
      alloyDesignation,
      chemicalComposition,
      standardSpec,
      hardness,
      testReportAvailable: documents.some(d => d.documentType === "test_report"),
      compositionCertAvailable: documents.some(d => d.documentType === "composition_cert"),
      specDeclaredOrVerified,
      dimensions: {
        length: dimLength ? Number(dimLength) : undefined,
        width: dimWidth ? Number(dimWidth) : undefined,
        heightOrThickness: dimHeight ? Number(dimHeight) : undefined,
        diameter: dimDiameter ? Number(dimDiameter) : undefined,
        wallThickness: dimWallThickness ? Number(dimWallThickness) : undefined,
        particleOrChipSize: particleSize || undefined,
        shapeOrPhysicalForm: shapeForm || "Solid by-product",
        dimensionUnit: dimUnit,
        weightPerPiece: weightPerPiece ? Number(weightPerPiece) : undefined,
        numberOfPieces: numberOfPieces ? Number(numberOfPieces) : undefined,
      },
      totalQuantity: Number(totalQuantity) || 100,
      quantityUnit,
      minOrderQuantity: Number(minOrderQuantity) || 50,
      pricePerUnit: Number(pricePerUnit) || 10,
      currency,
      negotiable,
      availableImmediately,
      availabilityStartDate,
      recurringSupply,
      expectedMonthlyQuantity: expectedMonthlyQuantity ? Number(expectedMonthlyQuantity) : undefined,
      storageLoadingConstraints,
      condition,
      contaminationStatus,
      residualOilCoolant,
      rustOxidation,
      mixedGradeStatus,
      sortingRequirements,
      cleaningProcessingReqs,
      inspectionStatus,
      qualityNotes,
      handlingRequirements,
      safetyInformation,
      requiredProcessingBeforeReuse: [
        requiredProcessingBeforeReuse,
        requiresRemelting ? "Requires furnace remelting." : "",
        requiresCutting ? "Requires shear cutting or band sawing." : "",
      ].filter(Boolean).join(" "),
      country,
      state,
      city,
      industrialArea,
      pickupDeliveryPreference,
      vehicleRestrictions,
      estimatedLoadingTime,
      images,
      documents,
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.listing) {
        router.push(`/listings/${data.listing.id}`);
      } else {
        setSubmitError(data.error || "Failed to save listing");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError("Server error while submitting listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-6 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Industrial Supplier Suite
              </span>
              <h1 className="text-2xl font-black">List Surplus Material / By-Product</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 border border-white/20"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Section Progress Indicator (Section 2.A) */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3 space-x-2 text-xs font-semibold">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 transition-colors ${
                  currentStep === step.id
                    ? "bg-brand-blue text-white shadow-sm"
                    : currentStep > step.id
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === step.id ? "bg-white text-brand-blue font-bold" : "bg-slate-200"
                }`}>
                  {currentStep > step.id ? "✓" : step.id}
                </span>
                <span>{step.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
          
          {/* =========================================================================
              STEP 1: Basic Material Information
             ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">1. Basic Material Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identify your by-product, manufacturing source, and commercial intention.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aerospace Grade 6061-T6 Extruded Aluminum Billet Cut-offs"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Material Name
                  </label>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="e.g. AA 6061 Billet End Cuts"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Material Category *
                  </label>
                  <select
                    value={materialCategory}
                    onChange={(e) => setMaterialCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {materialCategory === "Other industrial by-products" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Specify Custom Material Category
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Describe custom material category..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source Industry
                  </label>
                  <input
                    type="text"
                    value={sourceIndustry}
                    onChange={(e) => setSourceIndustry(e.target.value)}
                    placeholder="e.g. Aerospace Machining, Automotive Forging"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Manufacturing Process That Generated Surplus
                  </label>
                  <input
                    type="text"
                    value={manufacturingProcess}
                    onChange={(e) => setManufacturingProcess(e.target.value)}
                    placeholder="e.g. CNC Saw Cutting, Laser Cutting, Press Trimming"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Listing Type
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="sale">Commercial Sale</option>
                    <option value="reuse">Direct Material Reuse</option>
                    <option value="exchange">Barter / Material Exchange</option>
                    <option value="recycling">Secondary Recycling / Smelting</option>
                    <option value="donation">Donation / Research Grant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Intended Reuse (Where Known)
                  </label>
                  <input
                    type="text"
                    value={intendedReuse}
                    onChange={(e) => setIntendedReuse(e.target.value)}
                    placeholder="e.g. Smaller brackets, secondary billets, foundry ingot"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Description &amp; Technical Summary
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe lot segregation, storage state, cutting method, origin heat numbers, or any specific handling requirements..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                ></textarea>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: Material Specifications & Dimensions (Conditional by type)
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">2. Material Specifications &amp; Dimensions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide precise dimensions and metallurgical standards. Fields adapt to {materialCategory}.
                </p>
              </div>

              {/* Metallurgy */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                  Grade &amp; Chemical Composition
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Material Grade *</label>
                    <input
                      type="text"
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g. 6061-T6, SS304, EN8, D2, Brass C36000"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alloy Designation / UNS</label>
                    <input
                      type="text"
                      value={alloyDesignation}
                      onChange={(e) => setAlloyDesignation(e.target.value)}
                      placeholder="e.g. UNS A96061 / 1.4301 / CW614N"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Reference (ASTM/IS/DIN)</label>
                    <input
                      type="text"
                      value={standardSpec}
                      onChange={(e) => setStandardSpec(e.target.value)}
                      placeholder="e.g. ASTM B221 / IS 5517 / DIN 17200"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hardness / Temper</label>
                    <input
                      type="text"
                      value={hardness}
                      onChange={(e) => setHardness(e.target.value)}
                      placeholder="e.g. 95 HB / 58-60 HRC / Annealed"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chemical Composition (If Assayed)</label>
                  <input
                    type="text"
                    value={chemicalComposition}
                    onChange={(e) => setChemicalComposition(e.target.value)}
                    placeholder="e.g. Cr: 18.2%, Ni: 8.4%, C: 0.04% (Or write 'See attached MTR')"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Conditional Dimensions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                    Physical Dimensions Envelope
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Units:</span>
                    <select
                      value={dimUnit}
                      onChange={(e) => setDimUnit(e.target.value as any)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-bold"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inches">inches</option>
                      <option value="m">meters</option>
                    </select>
                  </div>
                </div>

                {/* Show Diameter for Billets/Rounds */}
                {(materialCategory.includes("Billet") || materialCategory.includes("Cast iron") || materialCategory.includes("Aluminium")) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Diameter ({dimUnit})</label>
                    <input
                      type="number"
                      value={dimDiameter}
                      onChange={(e) => setDimDiameter(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 120"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                )}

                {/* Length & Width & Height */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Length ({dimUnit})</label>
                    <input
                      type="number"
                      value={dimLength}
                      onChange={(e) => setDimLength(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 800"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Width ({dimUnit})</label>
                    <input
                      type="number"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 350"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Height / Thickness ({dimUnit})</label>
                    <input
                      type="number"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 3.0"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Chip size for CNC Swarf */}
                {materialCategory.includes("chips") && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Particle or Chip Size</label>
                    <input
                      type="text"
                      value={particleSize}
                      onChange={(e) => setParticleSize(e.target.value)}
                      placeholder="e.g. Needle curls 5mm-20mm length, centrifuge dried"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shape / Physical Form</label>
                    <input
                      type="text"
                      value={shapeForm}
                      onChange={(e) => setShapeForm(e.target.value)}
                      placeholder="e.g. Flat skeleton, cylindrical cut-off"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Weight per Piece (kg)</label>
                    <input
                      type="number"
                      value={weightPerPiece}
                      onChange={(e) => setWeightPerPiece(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 4.6"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Piece Count (Where Known)</label>
                    <input
                      type="number"
                      value={numberOfPieces}
                      onChange={(e) => setNumberOfPieces(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 540"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: Quantity, Price, and Availability
             ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">3. Quantity, Price, and Availability</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set available volume, commercial terms, and immediate pickup readiness.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Available Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 2480"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity Unit *
                  </label>
                  <select
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="tonnes">Tonnes (MT)</option>
                    <option value="pieces">Pieces</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Minimum Order Quantity (MOQ)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minOrderQuantity}
                    onChange={(e) => setMinOrderQuantity(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Asking Price (per {quantityUnit}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min={0.1}
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 245"
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-blue"
                    />
                    <span>Open to Commercial Negotiation</span>
                  </label>
                </div>
              </div>

              {/* Indicative Lot Value Banner */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-900 font-semibold block">Indicative Material Value</span>
                  <span className="text-xs text-slate-500">Calculated based on current asking rate</span>
                </div>
                <div className="text-2xl font-black text-brand-blue">
                  ₹{indicativeLotValue.toLocaleString()}
                </div>
              </div>

              {/* Recurring Supply Settings */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                  <input
                    type="checkbox"
                    checked={recurringSupply}
                    onChange={(e) => setRecurringSupply(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>This is a recurring manufacturing by-product stream</span>
                </label>

                {recurringSupply && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expected Monthly Replenishment ({quantityUnit})
                      </label>
                      <input
                        type="number"
                        value={expectedMonthlyQuantity}
                        onChange={(e) => setExpectedMonthlyQuantity(e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 1800"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Availability Start Date
                      </label>
                      <input
                        type="date"
                        value={availabilityStartDate}
                        onChange={(e) => setAvailabilityStartDate(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: Quality, Condition, and Safety
             ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">4. Quality, Condition, and Safety</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Declare surface contamination, oil state, and sorting steps to prevent downstream rejects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Surface Cleanliness State *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="clean">Clean (No visible dirt / oil)</option>
                    <option value="mixed">Mixed Grade / Some Foreign Matter</option>
                    <option value="oily">Residual Oil / Coolant Present</option>
                    <option value="wet">Wet / Aqueous Coolant</option>
                    <option value="oxidised">Oxidised / Light Rust</option>
                    <option value="damaged">Mechanically Deformed / Damaged</option>
                    <option value="other">Other / Specific State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Inspection Status
                  </label>
                  <select
                    value={inspectionStatus}
                    onChange={(e) => setInspectionStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="self_inspected">Self-Inspected by Plant QA</option>
                    <option value="third_party_inspected">Third-Party Lab Inspected (SGS/TUV/NABL)</option>
                    <option value="uninspected">Uninspected Raw Scrap</option>
                  </select>
                </div>
              </div>

              {/* Toggles for contamination */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={residualOilCoolant}
                    onChange={(e) => setResidualOilCoolant(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Residual Oil / Coolant</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rustOxidation}
                    onChange={(e) => setRustOxidation(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Surface Oxidation / Rust</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mixedGradeStatus}
                    onChange={(e) => setMixedGradeStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Contains Mixed Grades</span>
                </label>
              </div>

              {/* Safety Warning */}
              {(residualOilCoolant || rustOxidation || mixedGradeStatus) && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">Safety &amp; Pre-Treatment Advisory</span>
                    Buyers will see a quality notice advising degreasing or magnetic sorting prior to remelting.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contamination &amp; Cleaning Notes
                </label>
                <input
                  type="text"
                  value={contaminationStatus}
                  onChange={(e) => setContaminationStatus(e.target.value)}
                  placeholder="e.g. Centrifuge degreased, moisture under 0.2%, pass through magnetic separator"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Required Processing Before Reuse
                </label>
                <input
                  type="text"
                  value={requiredProcessingBeforeReuse}
                  onChange={(e) => setRequiredProcessingBeforeReuse(e.target.value)}
                  placeholder="e.g. De-filming, edge shearing, or direct induction furnace charging"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 5: Photos and Supporting Documents (Multi-Upload & Reorder)
             ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">5. Photos &amp; Supporting Documents</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload up to 8 technical photographs (overall view, condition close-up, dimensions scale).
                </p>
              </div>

              {/* Multi-Image Upload Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-2xl p-6 text-center bg-slate-50 hover:bg-blue-50/20 transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  id="img-upload-input"
                  className="hidden"
                />
                <label htmlFor="img-upload-input" className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {uploadingImage ? "Processing photographs..." : "Click to select or drag and drop photographs"}
                  </div>
                  <div className="text-xs text-slate-500">
                    PNG, JPG, SVG, WebP up to 10MB each (Maximum 8 images)
                  </div>
                </label>
              </div>

              {/* Uploaded Images Gallery & Reorder */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Uploaded Photographs ({images.length}/8)</span>
                    <span className="text-slate-400">Click star to designate Primary Marketplace thumbnail</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`relative rounded-xl overflow-hidden border-2 bg-slate-900 group ${
                          img.isPrimary ? "border-brand-blue shadow-md" : "border-slate-200"
                        }`}
                      >
                        <img src={img.storagePath} alt="" className="w-full h-28 object-cover" />

                        {img.isPrimary && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-blue text-white shadow-sm">
                            Primary
                          </span>
                        )}

                        <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              title="Set as Primary"
                              className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-brand-blue"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove Photo"
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-rose-600 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Upload Section (Section 2.H) */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                  Attach Certified Technical Documents
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Upload MTR */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Mill Test Report (MTR)</span>
                      <FileText className="w-4 h-4 text-brand-blue" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Original steel mill certificate proving heat number and elemental composition.
                    </p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload(e, "test_report")}
                      className="text-[11px] text-slate-500"
                    />
                  </div>

                  {/* Upload Chemical Cert */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Spectro Analysis / Lab Assay</span>
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Optical emission spectrometry report or third-party assay.
                    </p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload(e, "composition_cert")}
                      className="text-[11px] text-slate-500"
                    />
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-semibold text-slate-700">Attached Documents ({documents.length})</span>
                    {documents.map((doc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-950">{doc.title}</span>
                          <span className="text-[10px] text-slate-500 capitalize">({doc.documentType.replace("_", " ")})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200">
                          Uploaded
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 6: Location and Logistics
             ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">6. Location &amp; Logistics</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify factory region, loading crane availability, and vehicle accessibility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune, Bengaluru, Chennai"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra, Karnataka, Tamil Nadu"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Industrial Area / Zone *
                </label>
                <input
                  type="text"
                  required
                  value={industrialArea}
                  onChange={(e) => setIndustrialArea(e.target.value)}
                  placeholder="e.g. Chakan Phase 2 MIDC, Peenya Phase 1, Sriperumbudur Corridor"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pickup or Delivery Preference
                  </label>
                  <select
                    value={pickupDeliveryPreference}
                    onChange={(e) => setPickupDeliveryPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="pickup_only">Ex-Works / Buyer Arranges Pickup</option>
                    <option value="delivery_included">Delivery Included (Within Radius)</option>
                    <option value="negotiable">Negotiable Transport Terms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Loading Time
                  </label>
                  <input
                    type="text"
                    value={estimatedLoadingTime}
                    onChange={(e) => setEstimatedLoadingTime(e.target.value)}
                    placeholder="e.g. 45 minutes, 1 hour per 10 tonnes"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Accessibility &amp; Loading Constraints
                </label>
                <input
                  type="text"
                  value={vehicleRestrictions}
                  onChange={(e) => setVehicleRestrictions(e.target.value)}
                  placeholder="e.g. Up to 32-ft multi-axle trailers; overhead crane &amp; 3T forklift available on site"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 7: Intended Reuse & Compatibility Questions
             ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">7. Intended Reuse &amp; Compatibility</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help the AI matching engine connect your by-product to suitable manufacturing applications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Buyer Industry
                </label>
                <input
                  type="text"
                  value={preferredBuyerIndustry}
                  onChange={(e) => setPreferredBuyerIndustry(e.target.value)}
                  placeholder="e.g. Stamping, Precision CNC Machining, Secondary Smelting, Hardware"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Processing Requirements:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresRemelting}
                    onChange={(e) => setRequiresRemelting(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Requires furnace remelting before use</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresCutting}
                    onChange={(e) => setRequiresCutting(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Requires mechanical shear cutting or bandsaw sizing</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Restrictions or Disclaimers
                </label>
                <textarea
                  rows={3}
                  value={reuseRestrictions}
                  onChange={(e) => setReuseRestrictions(e.target.value)}
                  placeholder="e.g. Not approved for human medical implants; suitable for general structural or machinery use."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                ></textarea>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 8: Review and Publish
             ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">8. Review and Publish</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify the full technical dossier before publishing to the live industrial exchange.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-blue">{materialCategory}</span>
                    <h3 className="text-base font-extrabold text-navy-950 mt-0.5">{title || "Untitled Listing"}</h3>
                    <div className="text-slate-500 mt-0.5">{city}, {state} • {industrialArea}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-brand-blue">₹{pricePerUnit || 0}</span>
                    <span className="text-slate-500 ml-1">/ {quantityUnit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Grade</span>
                    <span className="font-bold text-slate-900">{grade || "Declared Commercial"}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Total Stock</span>
                    <span className="font-bold text-slate-900">{totalQuantity || 0} {quantityUnit}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Condition</span>
                    <span className="font-bold text-slate-900 capitalize">{condition}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Total Indicative Value</span>
                    <span className="font-bold text-brand-blue">₹{indicativeLotValue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-600">
                  <span>Attached Photographs: <strong>{images.length} images</strong></span>
                  <span>Attached Documents: <strong>{documents.length} verified/pending</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Footer */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                ← Back
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(false)}
                  className="px-8 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>{isSubmitting ? "Publishing to Exchange..." : "Publish Material Listing"}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
