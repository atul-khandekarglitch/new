"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { 
  BarChart3, 
  Layers, 
  ArrowRight, 
  Recycle, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Factory, 
  Flame, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function MaterialFlowPage() {
  const [selectedFacility, setSelectedFacility] = useState("automotive_forging");

  const FACILITY_MODELS = {
    automotive_forging: {
      name: "Precision Closed-Die Forging Line (Chakan, Pune)",
      rawMaterial: "EN8 / AISI 1045 Round Billets (15,000 kg)",
      finishedGoods: "10,200 kg (68%) Crankshafts & Connecting Rod Blanks",
      reusableFlash: "3,300 kg (22%) Shot-Blasted Flashings (Direct Remelt/Rerolling)",
      billetEndLoss: "1,050 kg (7%) Cold Saw Cut-offs (High Integrity)",
      scaleLoss: "450 kg (3%) Heavy Mill Scale (Sintering / Cement Additive)",
      circularValueRetention: "97.0%",
      emissionAvoided: "8.4 MT CO₂e",
    },
    aerospace_machining: {
      name: "5-Axis High-Speed CNC Aircraft Machining (Peenya, Bengaluru)",
      rawMaterial: "Al 6061-T6 Extruded Plate & Billets (5,000 kg)",
      finishedGoods: "1,250 kg (25%) Critical Aircraft Wing Ribs & Brackets",
      reusableFlash: "1,100 kg (22%) Solid Billet Ends & Large Drop Cuts",
      billetEndLoss: "2,550 kg (51%) Centrifugally Degreased Helical Turnings",
      scaleLoss: "100 kg (2%) Coolant Filter Cake Residue",
      circularValueRetention: "98.0%",
      emissionAvoided: "19.2 MT CO₂e",
    },
    sheet_laser: {
      name: "Fiber Laser Stamping & Enclosure Works (Sriperumbudur, Chennai)",
      rawMaterial: "SS304 Cold Rolled 3.0mm Sheets (8,000 kg)",
      finishedGoods: "5,440 kg (68%) Cleanroom & Medical Enclosures",
      reusableFlash: "1,920 kg (24%) Flat Skeleton Strips & Drop Plates",
      billetEndLoss: "560 kg (7%) High-density Laser Offcut Pieces",
      scaleLoss: "80 kg (1%) Laser Slag & Dross Residue",
      circularValueRetention: "99.0%",
      emissionAvoided: "11.6 MT CO₂e",
    },
  };

  const current = FACILITY_MODELS[selectedFacility as keyof typeof FACILITY_MODELS];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                Section 1.C &amp; Section 3 • Circular Mass Balance Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Material Flow Analysis &amp; Waste Diagnostics
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Visualizing transformation of virgin raw feedstocks into finished goods, reusable solids, and closed-loop cycles.
              </p>
            </div>

            {/* Model Selector */}
            <div className="flex bg-navy-900 rounded-xl p-1 border border-navy-700 text-xs">
              <button
                onClick={() => setSelectedFacility("automotive_forging")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedFacility === "automotive_forging" ? "bg-brand-blue text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Forging Line
              </button>
              <button
                onClick={() => setSelectedFacility("aerospace_machining")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedFacility === "aerospace_machining" ? "bg-brand-purple text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Aerospace CNC
              </button>
              <button
                onClick={() => setSelectedFacility("sheet_laser")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedFacility === "sheet_laser" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Sheet Laser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Model Title & KPIs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Active Diagnostic Topology</span>
              <h2 className="text-lg font-bold text-navy-950 mt-0.5">{current.name}</h2>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Circular Retention</span>
                <span className="text-xl font-black text-emerald-600">{current.circularValueRetention}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Avoided Carbon</span>
                <span className="text-xl font-black text-brand-blue">{current.emissionAvoided}</span>
              </div>
            </div>
          </div>

          {/* Interactive Material-Flow Visual Diagram (Sankey representation) */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-6">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-300 font-bold uppercase tracking-wider">
                Raw Inbound Mass: {current.rawMaterial}
              </span>
              <span className="text-slate-400">100% Mass Balance Accounted</span>
            </div>

            {/* Visual Stream Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              
              {/* Stream 1 */}
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Finished Product</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">Prime</span>
                </div>
                <div className="text-sm font-bold text-white">{current.finishedGoods}</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Shipped directly to automotive or aerospace OEM assembly line.
                </p>
              </div>

              {/* Stream 2 */}
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">Reusable Offcuts</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-cyan-200">Induscycle Loop</span>
                </div>
                <div className="text-sm font-bold text-white">{current.reusableFlash}</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Published on Induscycle for secondary stamping and precision blanking.
                </p>
              </div>

              {/* Stream 3 */}
              <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">Turnings / Drops</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900 text-purple-200">Secondary Smelt</span>
                </div>
                <div className="text-sm font-bold text-white">{current.billetEndLoss}</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Centrifuge degreased and channeled to authorized induction smelters.
                </p>
              </div>

              {/* Stream 4 */}
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">Residue / Slag</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900 text-rose-200">Treatment</span>
                </div>
                <div className="text-sm font-bold text-white">{current.scaleLoss}</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Neutralized and routed to road base or cement kiln additives.
                </p>
              </div>

            </div>

            {/* Retention Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-sans text-slate-400">
                <span>Value Recovery Efficiency</span>
                <span className="text-emerald-400 font-bold">{current.circularValueRetention} Value Preserved</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: "65%" }}></div>
                <div className="h-full bg-cyan-400" style={{ width: "23%" }}></div>
                <div className="h-full bg-purple-500" style={{ width: "9%" }}></div>
                <div className="h-full bg-rose-500" style={{ width: "3%" }}></div>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Diagnostic data generated from Induscycle&apos;s verified material balances.
            </span>
            <Link
              href="/marketplace"
              className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-600 transition-colors flex items-center gap-1.5"
            >
              <span>Explore Listed By-Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

    </div>
  );
}
