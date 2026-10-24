"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Shipment, ShipmentStageNumber } from "@/types";
import { 
  Truck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Navigation, 
  RotateCw,
  Phone,
  Search,
  Check
} from "lucide-react";

export default function TrackingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchTrackingInput, setSearchTrackingInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const fetchShipments = () => {
    setIsLoading(true);
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.shipments) {
          setShipments(data.shipments);
          if (!selectedShipment && data.shipments.length > 0) {
            setSelectedShipment(data.shipments[0]);
          } else if (selectedShipment) {
            const updated = data.shipments.find((s: Shipment) => s.id === selectedShipment.id);
            if (updated) setSelectedShipment(updated);
          }
        }
      })
      .catch((err) => console.error("Tracking fetch error:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleStepForward = async () => {
    if (!selectedShipment) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "step_forward" }),
      });
      const data = await res.json();
      if (data.success && data.shipment) {
        setSelectedShipment(data.shipment);
        fetchShipments();
      }
    } catch (err) {
      console.error("Step progress error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmReceipt = async (condition: "accepted_good" | "accepted_with_discrepancy" | "rejected") => {
    if (!selectedShipment) return;
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptConditionConfirmed: condition,
          receiptQuantityConfirmed: 12000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedShipment(data.shipment);
      }
    } catch (err) {
      console.error("Confirm receipt error:", err);
    }
  };

  const handleReportIssue = async () => {
    if (!selectedShipment || !issueText.trim()) return;
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueReported: issueText }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedShipment(data.shipment);
        setIssueSubmitted(true);
        setTimeout(() => setIssueSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Report issue error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                Section 41 • Logistics Milestones &amp; Waybill Tracking
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Shipment &amp; Delivery Tracking
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Multi-stage chain of custody for certified industrial consignments.
              </p>
            </div>

            {/* Quick Tracking Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTrackingInput}
                  onChange={(e) => setSearchTrackingInput(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. INDUS-TRK-88294)"
                  className="px-3.5 py-2 text-xs bg-navy-900 border border-navy-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue w-64"
                />
              </div>
              <button
                onClick={() => {
                  const found = shipments.find(s => s.trackingNumber.toLowerCase().includes(searchTrackingInput.toLowerCase()));
                  if (found) setSelectedShipment(found);
                  else alert("No consignment matches this tracking number.");
                }}
                className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Consignment Overview Banner */}
        {selectedShipment && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-navy-950">{selectedShipment.trackingNumber}</h2>
                    
                    {/* Clear Label for DEMO TRACKING (Mandated in Section 41) */}
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      DEMO TRACKING (Simulated Provider)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Consignment: <strong>{selectedShipment.listingTitle}</strong>
                  </div>
                </div>
              </div>

              {/* Simulation Interactive Control (Advance Stage 1 to 9) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStepForward}
                  disabled={isUpdating || selectedShipment.currentStage >= 9}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Step through the 9 logistics stages for test verification"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                  <span>
                    {selectedShipment.currentStage >= 9 ? "Consignment Completed (Stage 9)" : "Simulate Next Stage →"}
                  </span>
                </button>
              </div>
            </div>

            {/* Consignment Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Origin Dispatch</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.origin}</span>
                <span className="text-[11px] text-slate-500">{selectedShipment.supplierCompanyName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Destination Intake</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.destination}</span>
                <span className="text-[11px] text-slate-500">{selectedShipment.buyerCompanyName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Logistics Carrier</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.carrierName}</span>
                <span className="text-[11px] text-slate-500">{selectedShipment.vehicleNumber}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Distance &amp; Dates</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.distanceKm} km route</span>
                <span className="text-[11px] text-slate-500">
                  Est. Delivery: {selectedShipment.expectedDeliveryDate}
                </span>
              </div>
            </div>

            {/* 9-Stage Visual Stepper Timeline (Section 41 Mandated) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider">
                  Mandated 9-Stage Custody Timeline
                </span>
                <span className="text-brand-blue font-bold">
                  Stage {selectedShipment.currentStage} of 9
                </span>
              </div>

              <div className="relative">
                {/* Connecting track */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-0"></div>
                <div
                  className="absolute top-4 left-0 h-1 bg-brand-blue transition-all duration-500 -z-0"
                  style={{ width: `${((selectedShipment.currentStage - 1) / 8) * 100}%` }}
                ></div>

                {/* 9 Milestones */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 relative z-10 text-center">
                  {selectedShipment.timeline.map((evt) => {
                    const isCurrent = evt.stage === selectedShipment.currentStage;
                    const isPassed = evt.stage < selectedShipment.currentStage;

                    return (
                      <div key={evt.stage} className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isCurrent
                              ? "bg-brand-blue text-white ring-4 ring-blue-100 scale-110"
                              : isPassed
                              ? "bg-emerald-600 text-white"
                              : "bg-white border-2 border-slate-300 text-slate-400"
                          }`}
                        >
                          {isPassed ? "✓" : evt.stage}
                        </div>
                        <span className={`text-[10px] leading-tight block font-semibold ${
                          isCurrent ? "text-brand-blue font-bold" : isPassed ? "text-slate-800" : "text-slate-400"
                        }`}>
                          {evt.stageName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Stage Event Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5 text-brand-blue">
                  <Navigation className="w-4 h-4" />
                  <span>Current Milestone Details (Stage {selectedShipment.currentStage})</span>
                </span>
                <span className="text-slate-500">
                  {selectedShipment.timeline[selectedShipment.currentStage - 1]?.timestamp || "In Progress"}
                </span>
              </div>
              <p className="text-slate-700">
                {selectedShipment.timeline[selectedShipment.currentStage - 1]?.description}
              </p>
              <div className="text-[11px] text-slate-500">
                Location reported: <strong>{selectedShipment.timeline[selectedShipment.currentStage - 1]?.location}</strong>
              </div>
            </div>

            {/* Proof of Collection & Delivery Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Proof of Collection (Electronic Manifest)</span>
                  <FileText className="w-4 h-4 text-brand-blue" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Weighbridge tare slip &amp; driver signature recorded at supplier facility.
                </p>
                <div className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Tare: 15,450 kg • Gross: 27,450 kg</span>
                </div>
              </div>

              {/* Receipt Confirmation Actions for Buyer (Stage 8 & 9) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Intake Condition Confirmation</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                {selectedShipment.receiptConditionConfirmed ? (
                  <div className="p-2 rounded bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Intake Confirmed: Accepted Good Condition</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleConfirmReceipt("accepted_good")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Confirm Good Condition
                    </button>
                    <button
                      onClick={() => handleConfirmReceipt("accepted_with_discrepancy")}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold"
                    >
                      Weight Discrepancy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Delay or Issue Reporting */}
            <div className="pt-4 border-t border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800">Report Transit Delay or Logistics Issue</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="e.g. Checkpoint toll congestion delay of 4 hours, driver reported detour..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button
                  onClick={handleReportIssue}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Log Issue
                </button>
              </div>
              {issueSubmitted && (
                <div className="text-emerald-600 font-semibold">Issue logged on tracking timeline.</div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
