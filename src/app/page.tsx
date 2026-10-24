"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Truck, 
  CheckCircle2, 
  Layers, 
  Factory, 
  Sparkles, 
  Cpu, 
  Scale, 
  Recycle, 
  Flame, 
  FileText,
  ChevronRight,
  TrendingDown,
  Building2,
  Package
} from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [quickStats, setQuickStats] = useState({
    activeListingsCount: 5,
    totalQuantityTonnes: 38,
    verifiedRate: "100%",
    divertedValueINR: "₹1.4 Cr",
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar transparent={true} />
      <AuthModal />

      {/* =========================================================================
          HOMEPAGE HERO SECTION (GrabCAD Visual Design Reference)
          Dark navy blue on left -> electric bright blue -> violet/purple on right.
          Curved wave bottom edge transitioning into white content below.
         ========================================================================= */}
      <section className="relative bg-gradient-to-br from-[#060D20] via-[#0A2668] to-[#551DB5] text-white pt-12 pb-32 md:pb-44 lg:pb-52 overflow-hidden">
        
        {/* Subtle grid pattern & glow overlays */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-purple/30 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-brand-blue/25 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content (Col 1-7) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-brand-cyan backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Circular Manufacturing Network</span>
              </div>

              {/* Exact Mandated Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Turn Industrial By-Products into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-200">Valuable Resources</span>
              </h1>

              {/* Exact Mandated Supporting Text */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl font-normal leading-relaxed">
                Connector uses intelligent material matching, material-flow analysis, and cost-aware industrial networking to help manufacturers discover reusable materials, reduce waste, and build a more circular supply chain.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/marketplace"
                  className="px-7 py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <span>Explore Materials</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/listings/new"
                  className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/25 backdrop-blur-md transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <span>List Your Surplus</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>

              {/* Global Search Bar (Section 35) */}
              <div className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = `/marketplace?q=${encodeURIComponent(searchQuery)}`;
                  }}
                  className="p-2 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
                >
                  <div className="relative flex-1 w-full flex items-center">
                    <Search className="w-5 h-5 text-cyan-300 ml-3 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search materials, products, grades, companies, or locations..."
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-300 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-sm shadow-md transition-colors whitespace-nowrap"
                  >
                    Search
                  </button>
                </form>

                {/* Popular Search Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-300">
                  <span className="text-slate-400">Popular:</span>
                  <Link href="/marketplace?grade=6061" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200">
                    Al 6061-T6
                  </Link>
                  <Link href="/marketplace?category=Sheet-metal offcuts" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200">
                    SS304 Offcuts
                  </Link>
                  <Link href="/marketplace?grade=EN8" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200">
                    EN8 Forgings
                  </Link>
                  <Link href="/marketplace?category=CNC machining chips and turnings" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200">
                    Brass Swarf
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Industrial SaaS Visual (Col 8-12) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                
                {/* Visual Glassmorphic Card Container */}
                <div className="relative rounded-2xl bg-navy-900/80 border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
                  
                  {/* Card Header with Industrial SaaS Status */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Material Matcher • Active</span>
                    </div>
                    <span className="text-xs text-cyan-300 font-mono">AS9100 / IATF-16949</span>
                  </div>

                  {/* Flow Graphic / Visual Elements */}
                  <div className="mt-5 space-y-4">
                    
                    {/* Node 1: Origin Surplus */}
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center font-bold">
                          Al
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">6061-T6 Billet Cut-offs</div>
                          <div className="text-xs text-slate-300">Apex Aerospace, Bengaluru • 2,480 kg</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Verified MTR
                      </span>
                    </div>

                    {/* Connection animation line */}
                    <div className="flex items-center justify-center gap-2 py-1 text-slate-400">
                      <div className="h-4 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-400"></div>
                      <span className="text-[11px] font-mono text-cyan-300">AI Compatibility: 94% Match</span>
                      <div className="h-4 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-400"></div>
                    </div>

                    {/* Node 2: Matched Reusable Application */}
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                          <Recycle className="w-5 h-5 text-purple-300" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">Secondary Smelting Ingot Alloy</div>
                          <div className="text-xs text-slate-300">EcoMelters Intake Hub • Faridabad</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-cyan-300">Save 42% Cost</span>
                    </div>

                    {/* Environmental Impact Banner */}
                    <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-200">Carbon Abatement: 19.8 MT CO₂e</span>
                      </div>
                      <span className="text-xs font-bold text-white">Zero Landfill</span>
                    </div>

                  </div>

                  {/* Summary Metric Footer */}
                  <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-black text-cyan-300">100%</div>
                      <div className="text-[10px] text-slate-300 uppercase">Tracked Origin</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-white">₹1.4 Cr</div>
                      <div className="text-[10px] text-slate-300 uppercase">Material Value</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-purple-300">9 Stages</div>
                      <div className="text-[10px] text-slate-300 uppercase">Live Logistics</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Smooth Curved Wave Bottom Edge (GrabCAD Reference) */}
        <div className="hero-curve-mask">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C320,80 580,110 880,70 C1140,35 1320,90 1440,120 L1440,0 L0,0 Z"
              fill="#FFFFFF"
            ></path>
          </svg>
        </div>

      </section>


      {/* =========================================================================
          WHITE PRODUCT-INFORMATION SECTIONS (GrabCAD Alternating Reference)
          Generous whitespace, dark-blue headings, readable body text, blue CTA buttons.
         ========================================================================= */}

      {/* SECTION 1 — Intelligent Material Marketplace (Text Left, Illustration Right) */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Section 1 • Industrial Marketplace</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Intelligent Material Marketplace
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Factories produce high-quality offcuts, billet cut-offs, forging flash, and precision chips that traditionally get downcycled or stored indefinitely. Connector gives manufacturers an active marketplace to publish surplus materials with full dimensional, alloy, and condition data, connecting them directly with qualified industrial buyers.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Detailed dimensional capture (length, width, thickness, diameter, particle size).</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">High-resolution multi-image galleries with drag &amp; drop ordering.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Verified mill test reports and chemical composition certificates.</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-navy-950 text-sm">Live Surplus Feeds</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified Stock</span>
                </div>

                {/* Feed item 1 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:border-brand-blue transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 text-cyan-300 flex items-center justify-center font-bold text-sm">
                      SS304
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Laser Sheet Offcuts 3.0mm</div>
                      <div className="text-xs text-slate-500">2,150 kg • Sriperumbudur, Chennai</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">₹185 / kg</div>
                    <div className="text-xs text-brand-blue font-semibold">MTR Verified</div>
                  </div>
                </div>

                {/* Feed item 2 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:border-brand-blue transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-blue-900 text-blue-200 flex items-center justify-center font-bold text-sm">
                      6061
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Extruded Billet Ends Ø120mm</div>
                      <div className="text-xs text-slate-500">2,480 kg • Peenya, Bengaluru</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">₹245 / kg</div>
                    <div className="text-xs text-brand-blue font-semibold">Batch Segregated</div>
                  </div>
                </div>

                {/* Feed item 3 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:border-brand-blue transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-amber-950 text-amber-300 flex items-center justify-center font-bold text-sm">
                      EN8
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Drop Forging Flash Rings</div>
                      <div className="text-xs text-slate-500">15,300 kg • Chakan, Pune</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">₹48 / kg</div>
                    <div className="text-xs text-brand-blue font-semibold">Shot Blasted</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 2 — AI-Powered Material Matching (Illustration Left, Text Right) */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Visual on Left */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Compatibility Matrix Analysis</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    Decision-Support Score: 92/100
                  </span>
                </div>

                {/* Parameter rows */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">Material Category &amp; Grade</span>
                      <span className="text-slate-500">Declared: SS304 vs Target: AISI 304</span>
                    </div>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">Thickness &amp; Dimensions</span>
                      <span className="text-slate-500">Available: 3.0mm Plate vs Req: 2.5 - 5.0mm</span>
                    </div>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Envelope
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">Surface Condition &amp; Oil</span>
                      <span className="text-slate-500">Clean laser skeleton, protective film on</span>
                    </div>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acceptable
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-amber-900 block">Certification &amp; MTR</span>
                      <span className="text-amber-700">Original Mill Test Report verified on-file</span>
                    </div>
                    <span className="font-bold text-amber-700">Verified</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block mb-0.5">Why this match?</span>
                  Matches buyer specifications with zero critical metallurgical conflicts. Stated grade, dimensions, and quantities fulfill 100% of the active requirement.
                </div>
              </div>
            </div>

            {/* Text on Right */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="inline-flex items-center gap-2 text-brand-purple font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Section 2 • Deterministic Metallurgy Matching</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                AI-Powered Material Matching
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Industrial reuse cannot rely on superficial keyword searches. Connector evaluates metallurgical grades, physical dimensions, surface contamination status, mechanical hardness, batch size, buyer manufacturing tolerances, and delivery distance.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-purple mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Deterministic validation rules prevent dangerous metallurgical substitutions.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-purple mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Categorizes results: Compatible, Potentially Compatible, Incompatible, or Insufficient Data.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-purple mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Clear transparency on missing data with actionable steps before contract signing.</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-purple hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <span>Test Compatibility Checker</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 3 — Material Flow Analysis (Text Left, Diagram Right) */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>Section 3 • Circular Analytics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Material Flow Analysis
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Transform invisible scrap streams into transparent material balances. Connector maps every stage of manufacturing—showing how virgin raw materials split into prime finished goods, recoverable by-products, recyclable turnings, and disposal fractions.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Visual Sankey-inspired flow mapping across machining, forging, and stamping lines.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Identifies high-value waste hotspots and segregation opportunities.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Calculates economic recovery yields for closed-loop supply chains.</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/material-flow"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <span>Explore Flow Diagnostics</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              {/* Diagram container */}
              <div className="p-6 rounded-2xl bg-navy-950 text-white border border-navy-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">Material Mass Balance</span>
                  <span className="text-xs font-mono text-slate-400">Total Input: 10,000 kg</span>
                </div>

                {/* Flow steps visual */}
                <div className="space-y-3 font-mono text-xs">
                  {/* Step 1 */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Finished Components (Prime)</span>
                      <span className="text-emerald-400 font-bold">6,800 kg (68%)</span>
                    </div>
                    <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }}></div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-cyan-300">Reusable Offcuts &amp; Billet Ends (Connector Recirculation)</span>
                      <span className="text-cyan-300 font-bold">2,150 kg (21.5%)</span>
                    </div>
                    <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: "21.5%" }}></div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-300">Machining Swarf / Secondary Smelting</span>
                      <span className="text-amber-300 font-bold">850 kg (8.5%)</span>
                    </div>
                    <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "8.5%" }}></div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Process Scale &amp; Grinding Sludge (Treatment)</span>
                      <span className="text-rose-400 font-bold">200 kg (2.0%)</span>
                    </div>
                    <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: "2%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Circular Retention Rate:</span>
                  <span className="text-emerald-400 font-bold text-sm">89.5% Material Kept In Value</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 4 — Smarter Industrial Logistics (Illustration Left, Text Right) */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Delivered Cost Breakdown
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Net Savings: ₹88,400 (31%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Ex-Factory Material Cost</span>
                    <span className="text-sm font-bold text-navy-950">₹1,95,000</span>
                    <span className="text-[10px] text-slate-400">1,500 kg @ ₹130/kg</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Estimated Freight &amp; Tolls</span>
                    <span className="text-sm font-bold text-navy-950">₹14,200</span>
                    <span className="text-[10px] text-slate-400">320 km Dedicated Flatbed</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Packaging &amp; Forklift Loading</span>
                    <span className="text-sm font-bold text-navy-950">₹3,500</span>
                    <span className="text-[10px] text-slate-400">Palletized shrink wrap</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Spectro Lab Testing</span>
                    <span className="text-sm font-bold text-navy-950">₹3,500</span>
                    <span className="text-[10px] text-slate-400">Certified chemical assay</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-navy-950 block text-sm">Total Delivered Cost</span>
                    <span className="text-slate-600">Effective ₹144.1 / usable kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-slate-400">Virgin: ₹210 / kg</span>
                    <div className="text-base font-extrabold text-brand-blue">₹2,16,200</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Section 4 • Total Delivered Cost</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Smarter Industrial Logistics
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                A cheap by-product isn&apos;t cheap if freight, handling, and cleaning exceed savings. Connector calculates total delivered costs—combining material price, haulage rates, loading equipment, sorting, cutting, and lab testing into an honest landed cost per usable unit.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Route distance analysis with realistic commercial transport method quotations.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Interactive What-If Scenario simulator for break-even freight distances.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">9-stage consignment milestones with weighbridge tally and proof of delivery.</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/simulator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <span>Launch Cost Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 5 — Verified Circular Impact (Text Left, Illustration Right) */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Section 5 • ESG &amp; Auditable Impact</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Verified Circular Impact
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Sustainability claims demand audit trails. Connector links completed consignments, weighbridge receipts, and testing certificates to calculate verified material diversion, Scope 3 emission reductions, and energy savings.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Standardized conversion factors for aluminum, steel, brass, and tooling alloys.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Exportable digital certificates for ESG compliance and BRSR corporate filings.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Cryptographic audit log tracking document access and inspection approvals.</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <span>View Verified Listings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-emerald-950 text-white border border-emerald-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Audited ESG Dashboard</span>
                  <span className="text-xs font-mono text-emerald-400">FY 2026 Q3 Cumulative</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-700">
                    <span className="text-xs text-emerald-300 block">Total Diverted Mass</span>
                    <span className="text-2xl font-black text-white">41.2 Tonnes</span>
                    <span className="text-[10px] text-emerald-400">100% diverted from landfill</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-700">
                    <span className="text-xs text-emerald-300 block">Emissions Avoided</span>
                    <span className="text-2xl font-black text-emerald-300">114.6 MT CO₂e</span>
                    <span className="text-[10px] text-emerald-400">Secondary remelt savings</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-700">
                    <span className="text-xs text-emerald-300 block">Net Sourcing Savings</span>
                    <span className="text-2xl font-black text-white">₹38.4 Lakhs</span>
                    <span className="text-[10px] text-emerald-400">Buyer procurement benefit</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-700">
                    <span className="text-xs text-emerald-300 block">Verified Traceability</span>
                    <span className="text-2xl font-black text-cyan-300">100% Audit Pass</span>
                    <span className="text-[10px] text-emerald-400">Weighbridge &amp; MTR backed</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-900/40 border border-emerald-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-200">Compliant with Indian BRSR Core &amp; ISO 14044 LCA guidelines.</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-300 py-16 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">CONNECTOR</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                The industrial circular network turning factory by-products, machining chips, billet cuts, and sheet offcuts into verified secondary manufacturing feedstocks.
              </p>
              <div className="text-xs text-slate-500">
                © {new Date().getFullYear()} Connector Platform. All rights reserved.
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/marketplace" className="hover:text-white">Material Marketplace</Link></li>
                <li><Link href="/material-flow" className="hover:text-white">Material Flow Analysis</Link></li>
                <li><Link href="/simulator" className="hover:text-white">Cost &amp; Profit Simulator</Link></li>
                <li><Link href="/tracking" className="hover:text-white">Shipment Tracking</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Listing &amp; Roles</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/listings/new" className="hover:text-white">List Your Surplus</Link></li>
                <li><Link href="/dashboard/buyer" className="hover:text-white">Buyer Dashboard</Link></li>
                <li><Link href="/dashboard/seller" className="hover:text-white">Seller Dashboard</Link></li>
                <li><Link href="/marketplace?condition=clean" className="hover:text-white">Certified MTR Feed</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Compliance</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="text-slate-400">AS9100 / IATF-16949</span></li>
                <li><span className="text-slate-400">Non-Hazardous Industrial</span></li>
                <li><span className="text-slate-400">Privacy-Preserving RFQ</span></li>
                <li><span className="text-slate-400">Audit Trail Verification</span></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
