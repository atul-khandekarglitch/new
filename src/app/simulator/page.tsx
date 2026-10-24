"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { simulateBuyerWhatIf, simulateSellerWhatIf } from "@/lib/costCalculator";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Scale, 
  Layers, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  BarChart3
} from "lucide-react";

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

  // Buyer State
  const [buyerQty, setBuyerQty] = useState(2500);
  const [buyerSecondaryPrice, setBuyerSecondaryPrice] = useState(185); // SS304 surplus price
  const [buyerConventionalPrice, setBuyerConventionalPrice] = useState(285); // Prime virgin distributor price
  const [buyerTransportCost, setBuyerTransportCost] = useState(14500);
  const [buyerHandlingCost, setBuyerHandlingCost] = useState(4000);
  const [buyerProcessingCost, setBuyerProcessingCost] = useState(12500);
  const [buyerYieldPercent, setBuyerYieldPercent] = useState(96);
  const [buyerAdditionalFees, setBuyerAdditionalFees] = useState(3500);

  // Seller State
  const [sellerQty, setSellerQty] = useState(5000);
  const [sellerProposedPrice, setSellerProposedPrice] = useState(245); // Al 6061 price
  const [sellerHandlingPaid, setSellerHandlingPaid] = useState(8000);
  const [sellerProcessingPaid, setSellerProcessingPaid] = useState(15000);
  const [sellerPlatformFeePct, setSellerPlatformFeePct] = useState(1.5);
  const [sellerRejectedPct, setSellerRejectedPct] = useState(2);

  // Selected Comparison Preset (Low, Expected, High)
  const [comparisonPreset, setComparisonPreset] = useState<"expected" | "low_cost" | "high_cost">("expected");

  // Apply presets
  const applyBuyerPreset = (preset: "expected" | "low_cost" | "high_cost") => {
    setComparisonPreset(preset);
    if (preset === "low_cost") {
      setBuyerSecondaryPrice(165);
      setBuyerTransportCost(9500);
      setBuyerYieldPercent(99);
    } else if (preset === "high_cost") {
      setBuyerSecondaryPrice(210);
      setBuyerTransportCost(24000);
      setBuyerYieldPercent(88);
    } else {
      setBuyerSecondaryPrice(185);
      setBuyerTransportCost(14500);
      setBuyerYieldPercent(96);
    }
  };

  // Calculations
  const buyerResult = simulateBuyerWhatIf({
    name: "Current Model",
    requiredQuantity: buyerQty,
    supplierMaterialPrice: buyerSecondaryPrice,
    conventionalSourcingCostPerUnit: buyerConventionalPrice,
    transportCost: buyerTransportCost,
    handlingCost: buyerHandlingCost,
    processingCost: buyerProcessingCost,
    expectedUsableYieldPercent: buyerYieldPercent,
    additionalFees: buyerAdditionalFees,
  });

  const sellerResult = simulateSellerWhatIf({
    name: "Current Model",
    availableQuantity: sellerQty,
    proposedSellingPricePerUnit: sellerProposedPrice,
    collectionAndHandlingPaidBySeller: sellerHandlingPaid,
    processingPreparationCosts: sellerProcessingPaid,
    platformFeesPercent: sellerPlatformFeePct,
    expectedUnsoldOrRejectedPercent: sellerRejectedPct,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-cyan/20 text-cyan-300 border border-brand-cyan/30 mb-2">
                Section 42 • Interactive What-If Scenario Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Cost, Landed Savings &amp; Proceeds Simulator
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Transparent metallurgical formulas recalculating bottom-line impact as inputs change.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-navy-900 rounded-xl p-1 border border-navy-700">
              <button
                onClick={() => setActiveTab("buyer")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "buyer"
                    ? "bg-brand-blue text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Buyer Landed Savings
              </button>
              <button
                onClick={() => setActiveTab("seller")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "seller"
                    ? "bg-brand-purple text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Seller Net Proceeds
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* =========================================================================
            BUYER SCENARIO
           ========================================================================= */}
        {activeTab === "buyer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls (Col 1-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-navy-950">Buyer Scenario Inputs</h2>
                  <p className="text-xs text-slate-500">Test volume, freight limits, and usable manufacturing yield.</p>
                </div>

                {/* Scenario Presets */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => applyBuyerPreset("low_cost")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      comparisonPreset === "low_cost" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Low Cost
                  </button>
                  <button
                    onClick={() => applyBuyerPreset("expected")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      comparisonPreset === "expected" ? "bg-blue-100 text-brand-blue" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Expected
                  </button>
                  <button
                    onClick={() => applyBuyerPreset("high_cost")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      comparisonPreset === "high_cost" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    High Cost
                  </button>
                </div>
              </div>

              {/* Sliders & Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Required Quantity:</span>
                    <span className="text-brand-blue">{buyerQty.toLocaleString()} kg</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={25000}
                    step={100}
                    value={buyerQty}
                    onChange={(e) => setBuyerQty(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Secondary Material Asking Rate (₹/kg)
                    </label>
                    <input
                      type="number"
                      value={buyerSecondaryPrice}
                      onChange={(e) => setBuyerSecondaryPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Conventional Baseline Rate (Virgin/Distributor) (₹/kg)
                    </label>
                    <input
                      type="number"
                      value={buyerConventionalPrice}
                      onChange={(e) => setBuyerConventionalPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Transport Freight (₹)</label>
                    <input
                      type="number"
                      value={buyerTransportCost}
                      onChange={(e) => setBuyerTransportCost(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Forklift &amp; Handling (₹)</label>
                    <input
                      type="number"
                      value={buyerHandlingCost}
                      onChange={(e) => setBuyerHandlingCost(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Degreasing &amp; Cutting (₹)</label>
                    <input
                      type="number"
                      value={buyerProcessingCost}
                      onChange={(e) => setBuyerProcessingCost(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Expected Usable Manufacturing Yield:</span>
                    <span className="text-emerald-600">{buyerYieldPercent}% Usable</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={100}
                    step={1}
                    value={buyerYieldPercent}
                    onChange={(e) => setBuyerYieldPercent(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Reflects nesting scrap, trimming offcuts, or dross loss during secondary re-machining.
                  </span>
                </div>
              </div>

            </div>

            {/* Results & Key Decision Metrics (Col 8-12) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Savings Card */}
              <div className="bg-gradient-to-br from-emerald-950 to-navy-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                  Estimated Gross Savings
                </span>
                <div className="text-4xl font-black text-emerald-400">
                  ₹{buyerResult.estimatedGrossSavings.toLocaleString()}
                </div>
                <div className="text-xs text-slate-300">
                  Savings of <strong className="text-emerald-300 text-sm">{buyerResult.savingsPercent}%</strong> compared to conventional virgin sourcing.
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Conventional Cost:</span>
                    <span className="font-semibold text-white">₹{buyerResult.totalConventionalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Secondary Landed Cost:</span>
                    <span className="font-semibold text-cyan-300">₹{buyerResult.totalSecondaryDelivered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                    <span>Effective Cost per Usable Unit:</span>
                    <span className="text-emerald-400">₹{buyerResult.costPerUsableUnit} / kg</span>
                  </div>
                </div>
              </div>

              {/* Threshold & Sensitivity Metrics */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
                <span className="font-bold text-slate-900 block pb-2 border-b border-slate-200">
                  Sensitivity &amp; Break-Even Thresholds
                </span>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700 block">Break-Even Transport Cost:</span>
                    <span className="text-[10px] text-slate-400">Maximum allowable freight before savings turn zero</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">₹{buyerResult.maxAllowableTransport.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700 block">Maximum Affordable Material Price:</span>
                    <span className="text-[10px] text-slate-400">Ceiling price per unit supplier can charge</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">₹{buyerResult.maxAffordablePricePerUnit} / kg</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            SELLER SCENARIO
           ========================================================================= */}
        {activeTab === "seller" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Seller Inputs (Col 1-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="pb-3 border-b border-slate-200">
                <h2 className="text-lg font-bold text-navy-950">Seller Proceeds Inputs</h2>
                <p className="text-xs text-slate-500">Calculate net realization from factory surplus lots.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Available Surplus Lot Quantity:</span>
                    <span className="text-brand-purple">{sellerQty.toLocaleString()} kg</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={50000}
                    step={250}
                    value={sellerQty}
                    onChange={(e) => setSellerQty(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Proposed Selling Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      value={sellerProposedPrice}
                      onChange={(e) => setSellerProposedPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Platform Fee (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      value={sellerPlatformFeePct}
                      onChange={(e) => setSellerPlatformFeePct(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Collection &amp; Handling Paid by Plant (₹)
                    </label>
                    <input
                      type="number"
                      value={sellerHandlingPaid}
                      onChange={(e) => setSellerHandlingPaid(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Shot Blasting / Degreasing Costs (₹)
                    </label>
                    <input
                      type="number"
                      value={sellerProcessingPaid}
                      onChange={(e) => setSellerProcessingPaid(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Expected Unsold or Rejected Margin:</span>
                    <span className="text-rose-600">{sellerRejectedPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.5}
                    value={sellerRejectedPct}
                    onChange={(e) => setSellerRejectedPct(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Seller Realization Metrics (Col 8-12) */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-gradient-to-br from-purple-950 to-navy-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-300">
                  Estimated Net Proceeds Before Tax
                </span>
                <div className="text-4xl font-black text-purple-300">
                  ₹{sellerResult.netProceedsBeforeTax.toLocaleString()}
                </div>
                <div className="text-xs text-slate-300">
                  Effective net realization: <strong className="text-white text-sm">₹{sellerResult.netProceedsPerUnit} / kg</strong>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Gross Sales Value:</span>
                    <span className="font-semibold text-white">₹{sellerResult.grossSalesValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Preparation &amp; Platform Fees:</span>
                    <span className="font-semibold text-rose-300">-₹{sellerResult.totalSellerCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                    <span>Break-Even Selling Rate:</span>
                    <span className="text-purple-300">₹{sellerResult.breakEvenPrice} / kg</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
