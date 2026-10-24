"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { MaterialListing, MaterialCategory } from "@/types";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Tag, 
  Scale, 
  Layers, 
  Eye, 
  ArrowUpDown, 
  Bookmark, 
  BellRing,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Camera
} from "lucide-react";

const FALLBACK_INDUSTRIAL_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="defaultBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%230265ff"/></linearGradient></defs><rect width="600" height="400" fill="url(%23defaultBg)"/><circle cx="300" cy="180" r="70" fill="none" stroke="url(%23accentG)" stroke-width="4" stroke-dasharray="10 8"/><path d="M 270,180 L 330,180 M 300,150 L 300,210" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><text x="300" y="300" fill="%23e2e8f0" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">INDUSCYCLE CERTIFIED MATERIAL</text><text x="300" y="330" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Physical Sample Pending Supplier Photo Upload</text></svg>`;

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  { label: "Mild & Carbon Steel", value: "Mild steel and carbon steel" },
  { label: "Stainless Steel", value: "Stainless steel" },
  { label: "Alloy Steel", value: "Alloy steel" },
  { label: "Aluminium Alloys", value: "Aluminium" },
  { label: "Copper & Brass", value: "Copper and brass" },
  { label: "Cast Iron", value: "Cast iron" },
  { label: "CNC Chips & Turnings", value: "CNC machining chips and turnings" },
  { label: "Forging Flash", value: "Forging flash" },
  { label: "Billet Cut-offs", value: "Billet cut-offs" },
  { label: "Sheet-Metal Offcuts", value: "Sheet-metal offcuts" },
  { label: "Casting Runners & Gates", value: "Casting runners and gates" },
  { label: "Tool Steel & Carbide", value: "Tool steel and carbide scrap" },
  { label: "Plastic Production Scrap", value: "Plastic production scrap" },
  { label: "Packaging Materials", value: "Packaging materials" },
  { label: "Other By-Products", value: "Other industrial by-products" },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [grade, setGrade] = useState(searchParams.get("grade") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [verification, setVerification] = useState(searchParams.get("verification") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  
  const [listings, setListings] = useState<MaterialListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savedSearchSuccess, setSavedSearchSuccess] = useState(false);

  // Debounced search fetch
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "all") params.set("category", category);
    if (grade) params.set("grade", grade);
    if (condition && condition !== "all") params.set("condition", condition);
    if (location) params.set("location", location);
    if (verification && verification !== "all") params.set("verification", verification);
    params.set("sort", sort);

    const timer = setTimeout(() => {
      fetch(`/api/search?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setListings(data.results || []);
            setSuggestions(data.suggestions || []);
          }
        })
        .catch((err) => console.error("Search fetch failed:", err))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, category, grade, condition, location, verification, sort]);

  const handleSaveSearch = async () => {
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category, location }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSearchSuccess(true);
        setTimeout(() => setSavedSearchSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Save search failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <AuthModal />

      {/* Header Bar with Global Search (Section 35) */}
      <section className="bg-navy-950 text-white py-10 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-cyan/20 text-cyan-300 border border-brand-cyan/30 mb-2">
                Induscycle By-Product Exchange
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Industrial Material Marketplace
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Discover verified surplus metals, billet ends, CNC chips, and sheet offcuts from certified manufacturers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSearch}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-slate-200 transition-colors"
                title="Save search parameters and get alerted on new matches"
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-300" />
                <span>{savedSearchSuccess ? "Search Saved!" : "Save Search Alert"}</span>
              </button>

              <Link
                href="/listings/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-xs font-bold text-white shadow-md transition-colors"
              >
                + List Your Surplus
              </Link>
            </div>
          </div>

          {/* Prominent Global Search Input */}
          <div className="relative">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-300 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search materials, products, grades, companies, or locations..."
                className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="px-2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Autocomplete suggestion pills */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-slate-300">
                <span className="text-slate-400">Suggestions:</span>
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 border border-white/10 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area: Sidebar Filters & Product Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Filter className="w-4 h-4 text-brand-blue" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setGrade("");
                    setCondition("all");
                    setLocation("");
                    setVerification("all");
                  }}
                  className="text-xs text-brand-blue font-semibold hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Material Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Material Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Alloy Grade
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 6061, SS304, EN8, D2"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {/* Surface Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Condition &amp; Cleanliness
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="all">All Conditions</option>
                  <option value="clean">Clean (No oil / dry)</option>
                  <option value="mixed">Mixed Grade / Tolerant</option>
                  <option value="oily">Residual Oil / Coolant</option>
                  <option value="oxidised">Oxidised / Light Rust</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Location / Industrial Cluster
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Pune, Bengaluru, Chennai"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Verification Status
                </label>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="verif"
                      checked={verification === "all"}
                      onChange={() => setVerification("all")}
                      className="text-brand-blue"
                    />
                    <span>All Listings</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="verif"
                      checked={verification === "verified"}
                      onChange={() => setVerification("verified")}
                      className="text-brand-blue"
                    />
                    <span className="font-semibold text-emerald-700">Verified Test Reports (MTR) Only</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Top Toolbar: Result Count & Sort Options */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-600">
                Showing <strong className="text-slate-900">{listings.length}</strong> available material listings
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest Published</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="qty_desc">Available Quantity (High to Low)</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
                ))}
              </div>
            )}

            {/* Empty State with Suggestions (Section 35) */}
            {!isLoading && listings.length === 0 && (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No material listings match your search</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Try broadening your search term, removing specific grade or condition filters, or browsing other categories.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                      setGrade("");
                      setCondition("all");
                    }}
                    className="px-4 py-2 rounded-lg bg-brand-blue text-white font-semibold"
                  >
                    Clear All Filters
                  </button>
                  <Link
                    href="/listings/new"
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    List this material requirement
                  </Link>
                </div>
              </div>
            )}

            {/* Product Cards (Mandated Specifications) */}
            {!isLoading && listings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {listings.map((item) => {
                  const hasCustomImage = item.images && item.images.length > 0 && item.images[0].storagePath;
                  const displayImg = hasCustomImage ? item.images[0].storagePath : FALLBACK_INDUSTRIAL_PLACEHOLDER;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-blue transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Primary Image Viewport */}
                        <div className="relative h-48 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                          <img
                            src={displayImg}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Prompt if listing has no real custom photograph */}
                          {!hasCustomImage && (
                            <div className="absolute bottom-2 left-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-950/80 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                                Photo upload requested
                              </span>
                            </div>
                          )}

                          {/* Verification Badge */}
                          <div className="absolute top-3 left-3">
                            {item.verificationState === "verified" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                MTR Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-600/90 text-white backdrop-blur-md shadow-sm">
                                Declared Spec
                              </span>
                            )}
                          </div>

                          {/* Category Tag Top Right */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-navy-950/80 text-cyan-200 backdrop-blur-md">
                              {item.materialCategory}
                            </span>
                          </div>

                          {/* Condition pill bottom right */}
                          <div className="absolute bottom-2 right-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 backdrop-blur-md">
                              Condition: {item.condition}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          
                          {/* Title */}
                          <div>
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.city}, {item.state} (Industrial Hub)</span>
                            </div>
                          </div>

                          {/* Technical Highlights Bar */}
                          <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Grade</span>
                              <span className="font-bold text-slate-800 truncate block">{item.grade}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Available Stock</span>
                              <span className="font-bold text-slate-800 block">
                                {item.totalQuantity.toLocaleString()} {item.quantityUnit}
                              </span>
                            </div>
                            {item.dimensions && (
                              <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                                <span>Dimensions:</span>
                                <span className="font-medium text-slate-800">
                                  {item.dimensions.diameter 
                                    ? `Ø ${item.dimensions.diameter}mm × ${item.dimensions.length || 'varies'}mm`
                                    : item.dimensions.length && item.dimensions.width
                                    ? `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.heightOrThickness || 0} ${item.dimensions.dimensionUnit}`
                                    : item.dimensions.shapeOrPhysicalForm || "Standard Piece"}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Card Footer: Price & CTA */}
                      <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Indicative Price</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-brand-blue">
                              ₹{item.pricePerUnit}
                            </span>
                            <span className="text-xs text-slate-500">/ {item.quantityUnit}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/checkout/${item.id}`}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <span>Buy</span>
                          </Link>

                          <Link
                            href={`/listings/${item.id}`}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-blue text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium mt-3">Loading marketplace materials...</p>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
