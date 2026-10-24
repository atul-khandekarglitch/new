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
  Check,
  Radio,
  Gauge,
  Activity,
  UserCheck,
  ChevronRight,
  RotateCcw,
  Compass,
  Layers,
  ArrowRight,
  Building2
} from "lucide-react";

const DEFAULT_SHIPMENT: Shipment = {
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
    { stage: 1, stageName: "Awaiting collection", timestamp: "2026-10-21T16:00:00Z", location: "Pune Factory Hub", description: "Dispatch bay reserved; electronic consignment waybill generated.", completed: true, operator: "Chakan Dispatch Lead", source: "Operator Verification" },
    { stage: 2, stageName: "Collection scheduled", timestamp: "2026-10-22T08:00:00Z", location: "Chakan MIDC Phase 3", description: "Vehicle MH-14-GH-4920 reported at factory gate security.", completed: true, operator: "Mahindra Logistics", source: "Operator Verification" },
    { stage: 3, stageName: "Collected", timestamp: "2026-10-22T15:30:00Z", location: "Precision Forgings Plant Gate 2", description: "Tare weight & gross weight verified on weighbridge (Gross: 27,450 kg). Loaded & sealed.", completed: true, operator: "Weighbridge Terminal", source: "Weighbridge Automated Scan" },
    { stage: 4, stageName: "In transit", timestamp: "2026-10-24T14:10:00Z", location: "NH-48 Corridor (Udaipur Bypass)", description: "GPS transponder active; vehicle progressing toward Delhi-NCR corridor on schedule.", completed: true, operator: "GPS Telematics", source: "Simulated GPS" },
    { stage: 5, stageName: "Near destination", timestamp: "Expected 2026-10-25T18:00:00Z", location: "Gurugram / Ballabhgarh entry checkpoint", description: "Pending toll clearance and green corridor verification.", completed: false, operator: "Checkpoint Toll", source: "Simulated GPS" },
    { stage: 6, stageName: "Out for delivery", timestamp: "Expected 2026-10-26T07:30:00Z", location: "Sector 58 Faridabad industrial bypass", description: "Local route dispatch scheduled for receiver plant.", completed: false, operator: "Faridabad Hub", source: "Operator Verification" },
    { stage: 7, stageName: "Delivered", timestamp: "Expected 2026-10-26T11:00:00Z", location: "EcoMelters Inbound Unloading Bay", description: "Vehicle arrival and security check-in.", completed: false, operator: "EcoMelters Security", source: "Operator Verification" },
    { stage: 8, stageName: "Receipt confirmation pending", timestamp: "Expected 2026-10-26T14:00:00Z", location: "Buyer Quality QA Lab", description: "Receiver weighbridge tally and optical emission spectrometer QA sampling.", completed: false, operator: "QA Lab", source: "Operator Verification" },
    { stage: 9, stageName: "Completed", timestamp: "Expected 2026-10-26T16:00:00Z", location: "Induscycle Escrow Settlement", description: "Digital Proof of Delivery accepted; transaction completed.", completed: false, operator: "Escrow Admin", source: "Operator Verification" }
  ],
  proofOfCollectionDoc: "/docs/shipments/poc_88294.pdf"
};

export default function TrackingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([DEFAULT_SHIPMENT]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(DEFAULT_SHIPMENT);
  const [searchTrackingInput, setSearchTrackingInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(54);

  // Oscillate speed slightly when in transit to create authentic live GPS telemetry feeling
  useEffect(() => {
    if (selectedShipment && selectedShipment.currentStage === 4) {
      const interval = setInterval(() => {
        setSimulatedSpeed(prev => {
          const delta = (Math.random() - 0.5) * 4;
          return Math.round(Math.min(64, Math.max(46, prev + delta)));
        });
      }, 3000);
      return () => clearInterval(interval);
    } else if (selectedShipment && selectedShipment.currentStage >= 7) {
      setSimulatedSpeed(0);
    } else {
      setSimulatedSpeed(35);
    }
  }, [selectedShipment?.currentStage]);

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

  const handleResetSimulation = async () => {
    if (!selectedShipment) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success && data.shipment) {
        setSelectedShipment(data.shipment);
        fetchShipments();
      }
    } catch (err) {
      console.error("Reset simulation error:", err);
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
          receiptQuantityConfirmed: selectedShipment.receiptQuantityConfirmed || 12000,
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

  const progressPercent = selectedShipment
    ? Math.round(((selectedShipment.currentStage - 1) / 8) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <AuthModal />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>DEMO TRACKING MODE (SIMULATED GPS TELEMETRY)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Live Custody Transfer &amp; Shipment Tracking
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Multi-stage chain of custody for certified industrial consignments, weighbridge slips, and automated custody transfer.
              </p>
            </div>

            {/* Quick Consignment Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedShipment?.id || ""}
                onChange={(e) => {
                  const found = shipments.find(s => s.id === e.target.value);
                  if (found) setSelectedShipment(found);
                }}
                className="px-3.5 py-2 text-xs bg-navy-900 border border-navy-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue font-semibold"
              >
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trackingNumber} — {s.supplierCompanyName.split(" ")[0]} ({s.origin.split(",")[0]} → {s.destination.split(",")[0]})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={searchTrackingInput}
                  onChange={(e) => setSearchTrackingInput(e.target.value)}
                  placeholder="ID (e.g. 88294)"
                  className="px-3 py-2 text-xs bg-navy-900 border border-navy-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue w-28 placeholder-slate-400"
                />
                <button
                  onClick={() => {
                    const found = shipments.find(s => s.trackingNumber.toLowerCase().includes(searchTrackingInput.toLowerCase()));
                    if (found) setSelectedShipment(found);
                    else alert("No consignment matches this tracking number.");
                  }}
                  className="px-3.5 py-2 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {selectedShipment && (
          <div className="space-y-6">
            
            {/* 1. MANDATED DARK NAVY ROUTE PANEL: LIVE CLUSTER GPS ROUTE */}
            <div className="bg-gradient-to-br from-navy-950 via-[#0d1836] to-navy-900 rounded-3xl p-6 sm:p-8 text-white border border-navy-800 shadow-2xl relative overflow-hidden">
              
              {/* Background Geodetic Grid Accent */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-navy-800/80">
                
                {/* Consignment Title & Badge */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
                      <span>LIVE CLUSTER GPS ROUTE</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                      DEMO TRACKING (SIMULATED GPS)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Waybill: {selectedShipment.gpsStatus?.eWayBillNumber || "EWB-88294-2026-IN"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>{selectedShipment.trackingNumber}</span>
                    <span className="text-slate-500 font-normal text-sm">/</span>
                    <span className="text-slate-300 font-bold text-sm sm:text-base truncate max-w-md">
                      {selectedShipment.listingTitle}
                    </span>
                  </h2>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Origin: <strong className="text-white">{selectedShipment.origin}</strong></span>
                    <span>→</span>
                    <span>Destination: <strong className="text-white">{selectedShipment.destination}</strong></span>
                  </div>
                </div>

                {/* Simulation Control Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleStepForward}
                    disabled={isUpdating || selectedShipment.currentStage >= 9}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Advance to next custody milestone"
                  >
                    <RotateCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
                    <span>
                      {selectedShipment.currentStage >= 9
                        ? "Consignment Completed (Stage 9)"
                        : "Advance Custody Stage (Demo Simulator) →"}
                    </span>
                  </button>

                  <button
                    onClick={handleResetSimulation}
                    disabled={isUpdating}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-all text-xs font-semibold flex items-center gap-1.5"
                    title="Reset simulation to Stage 1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Real-Time GPS Telemetry Dashboard Grid */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 py-6 text-xs">
                
                {/* Live Speed */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Simulated Telematics Speed</span>
                    <Gauge className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{simulatedSpeed}</span>
                    <span className="text-xs text-slate-400 font-semibold">km/h</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Transponder: Active Online</span>
                  </div>
                </div>

                {/* Route Progress */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Route Completed</span>
                    <Navigation className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-brand-cyan">{progressPercent}%</span>
                    <span className="text-xs text-slate-400 font-semibold">({selectedShipment.distanceKm} km total)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-brand-cyan h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Coordinates */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Current GPS Coordinates</span>
                    <MapPin className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="font-mono text-sm font-bold text-white pt-1">
                    {selectedShipment.currentCoordinates?.lat.toFixed(4)}° N, {selectedShipment.currentCoordinates?.lng.toFixed(4)}° E
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Corridor: {selectedShipment.timeline[selectedShipment.currentStage - 1]?.location || "In Transit"}
                  </div>
                </div>

                {/* ETA & Last Ping */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Estimated Arrival</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-black text-white pt-1">
                    {selectedShipment.expectedDeliveryDate}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Live ping: {selectedShipment.gpsStatus?.lastPingTimestamp ? new Date(selectedShipment.gpsStatus.lastPingTimestamp).toLocaleTimeString() : "Just now"}
                  </div>
                </div>

              </div>

              {/* Simulated Route Vector Graphic Canvas */}
              <div className="relative z-10 p-4 rounded-2xl bg-[#070d1e] border border-navy-700/80 text-xs space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Real-Time Route Waypoint Corridor (Corridor NH-48 / Western Dedicated Freight)</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {selectedShipment.currentStage >= 7 ? "ARRIVED AT DESTINATION" : "MOVING AT CRUISE SPEED"}
                  </span>
                </div>

                {/* Route Vector Map */}
                <div className="relative h-20 w-full flex items-center justify-between px-6 bg-[#0a1226] rounded-xl border border-navy-800 overflow-hidden">
                  
                  {/* Connecting Route Line */}
                  <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-slate-800 -z-0"></div>
                  <div 
                    className="absolute left-8 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-500 via-brand-cyan to-brand-blue -z-0 transition-all duration-700"
                    style={{ width: `calc((100% - 4rem) * ${progressPercent / 100})` }}
                  ></div>

                  {/* Origin Node */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-lg shadow-emerald-500/50">
                      O
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 mt-1">Origin Plant</span>
                  </div>

                  {/* Waypoint 1: Toll Gate */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      progressPercent >= 30 ? "bg-cyan-400 border-cyan-300" : "bg-slate-800 border-slate-700"
                    }`}></div>
                    <span className="text-[9px] text-slate-400 mt-1">Toll Gate 1</span>
                  </div>

                  {/* Waypoint 2: State Border */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      progressPercent >= 60 ? "bg-cyan-400 border-cyan-300" : "bg-slate-800 border-slate-700"
                    }`}></div>
                    <span className="text-[9px] text-slate-400 mt-1">Checkpost</span>
                  </div>

                  {/* Waypoint 3: City Ring Road */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      progressPercent >= 85 ? "bg-cyan-400 border-cyan-300" : "bg-slate-800 border-slate-700"
                    }`}></div>
                    <span className="text-[9px] text-slate-400 mt-1">Ring Road</span>
                  </div>

                  {/* Destination Node */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${
                      progressPercent >= 95 ? "bg-brand-blue text-white shadow-lg shadow-blue-500/50" : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      D
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 mt-1">Destination</span>
                  </div>

                  {/* Active Vehicle Beacon */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-700"
                    style={{ left: `calc(2rem + (100% - 4rem) * ${progressPercent / 100})` }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-cyan-400 opacity-60 animate-ping"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-blue text-slate-950 flex items-center justify-center shadow-xl border-2 border-white">
                        <Truck className="w-4 h-4 text-slate-950" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* 2. TRANSPORTER & DRIVER INFORMATION CARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">
                        Designated Transporter &amp; Fleet Logistics
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Authorized industrial carrier with digital GPS transponder certification
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Verified Carrier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Carrier Partner</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.carrierName}</span>
                    <span className="text-[10px] text-slate-500">National Logistics Permit</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Vehicle Registration</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.vehicleNumber}</span>
                    <span className="text-[10px] text-slate-500">GPS Hard-wired Unit</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Driver &amp; Contact</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{selectedShipment.driverContact}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Identity &amp; License Verified</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Electronic Security Seal: <strong>#INDUS-SEAL-88294</strong> (Tamper-evident)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Tare Slip #9921 recorded at dispatch weighbridge
                  </span>
                </div>
              </div>

              {/* Consignment Party Summary */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
                <h3 className="font-black text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-blue" />
                  <span>Trade Counterparties</span>
                </h3>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Consignor (Supplier)</span>
                  <div className="font-bold text-slate-900">{selectedShipment.supplierCompanyName}</div>
                  <div className="text-[11px] text-slate-500">{selectedShipment.origin}</div>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Consignee (Intake Buyer)</span>
                  <div className="font-bold text-slate-900">{selectedShipment.buyerCompanyName}</div>
                  <div className="text-[11px] text-slate-500">{selectedShipment.destination}</div>
                </div>
              </div>

            </div>

            {/* 3. 9-STAGE CUSTODY PROGRESS TRACKER (HORIZONTAL STEPPER) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-blue" />
                    <span>Mandated 9-Stage Chain of Custody</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Every state transition is cryptographically verified against operator logs and GPS sensors
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-blue text-white shadow-sm">
                  Stage {selectedShipment.currentStage} of 9
                </span>
              </div>

              {/* Horizontal Stepper */}
              <div className="relative pt-2 pb-4">
                
                {/* Connecting Line */}
                <div className="absolute top-7 left-4 right-4 h-1.5 bg-slate-200 -z-0"></div>
                <div
                  className="absolute top-7 left-4 h-1.5 bg-gradient-to-r from-emerald-500 to-brand-blue transition-all duration-500 -z-0"
                  style={{ width: `calc((100% - 2rem) * ${(selectedShipment.currentStage - 1) / 8})` }}
                ></div>

                {/* 9 Stages */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 relative z-10 text-center">
                  {selectedShipment.timeline.map((evt) => {
                    const isCurrent = evt.stage === selectedShipment.currentStage;
                    const isPassed = evt.stage < selectedShipment.currentStage;

                    return (
                      <div key={evt.stage} className="flex flex-col items-center space-y-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-md ${
                            isCurrent
                              ? "bg-brand-blue text-white ring-4 ring-blue-100 scale-110"
                              : isPassed
                              ? "bg-emerald-600 text-white"
                              : "bg-white border-2 border-slate-300 text-slate-400"
                          }`}
                        >
                          {isPassed ? "✓" : evt.stage}
                        </div>
                        <span className={`text-[10px] leading-tight block font-bold max-w-[85px] ${
                          isCurrent ? "text-brand-blue" : isPassed ? "text-slate-800" : "text-slate-400"
                        }`}>
                          {evt.stageName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Milestone Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-brand-blue">
                    <Navigation className="w-4 h-4" />
                    <span>Current Active Milestone: Stage {selectedShipment.currentStage} ({selectedShipment.timeline[selectedShipment.currentStage - 1]?.stageName})</span>
                  </span>
                  <span className="text-slate-500 font-mono">
                    {selectedShipment.timeline[selectedShipment.currentStage - 1]?.timestamp || "In Progress"}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {selectedShipment.timeline[selectedShipment.currentStage - 1]?.description}
                </p>
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-4 pt-1">
                  <span>Location: <strong>{selectedShipment.timeline[selectedShipment.currentStage - 1]?.location}</strong></span>
                  <span>Operator: <strong>{selectedShipment.timeline[selectedShipment.currentStage - 1]?.operator || "Logistics Terminal"}</strong></span>
                  <span>Source: <strong className="text-emerald-700">{selectedShipment.timeline[selectedShipment.currentStage - 1]?.source || "Operator Verification"}</strong></span>
                </div>
              </div>

            </div>

            {/* 4. VERTICAL CUSTODY AUDIT TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Vertical Timeline (Cols 1-2) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>Custody Transfer Audit Log</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Chronological verification events
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {selectedShipment.timeline.map((evt) => {
                    const isPassed = evt.stage <= selectedShipment.currentStage;
                    return (
                      <div key={evt.stage} className="relative flex items-start gap-4">
                        {/* Dot */}
                        <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                          isPassed
                            ? "bg-emerald-600 border-white text-white shadow-sm"
                            : "bg-white border-slate-300 text-slate-300"
                        }`}>
                          {isPassed ? "✓" : evt.stage}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">
                              Stage {evt.stage}: {evt.stageName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {evt.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{evt.description}</p>
                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                            <span>Facility: <strong>{evt.location}</strong></span>
                            <span>Actor: <strong>{evt.operator || "Logistics Officer"}</strong></span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                              {evt.source || "Operator Verification"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Intake Actions & Issue Reporting */}
              <div className="space-y-6">
                
                {/* Proof of Collection & Delivery */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Intake Quality &amp; Intake Bay</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Upon delivery arrival, receiver verifies weighbridge tally and visual/chemical inspection.
                  </p>

                  {selectedShipment.receiptConditionConfirmed ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>Intake Confirmed: {selectedShipment.receiptConditionConfirmed.replace("_", " ").toUpperCase()}</div>
                        <div className="text-[10px] font-normal text-emerald-700">Tally: {selectedShipment.receiptQuantityConfirmed || 12000} kg verified</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleConfirmReceipt("accepted_good")}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs transition-all"
                      >
                        Confirm Good Intake Condition (Stage 9)
                      </button>
                      <button
                        onClick={() => handleConfirmReceipt("accepted_with_discrepancy")}
                        className="w-full py-2 px-4 border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-xl font-semibold text-xs transition-all"
                      >
                        Accept with Weight Discrepancy
                      </button>
                    </div>
                  )}
                </div>

                {/* Report Delay / Issue */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
                  <span className="font-bold text-slate-900 block text-sm">
                    Log Transit Exception or Issue
                  </span>
                  <p className="text-slate-500">
                    Report traffic congestion, toll delays, or weighbridge variances to both trading parties.
                  </p>
                  <textarea
                    rows={2}
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder="e.g. 4-hour delay at entry toll due to heavy regional axle checking..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs"
                  />
                  <button
                    onClick={handleReportIssue}
                    disabled={!issueText.trim()}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    Log Issue on Tracking Trail
                  </button>
                  {issueSubmitted && (
                    <div className="text-emerald-600 font-semibold text-[11px]">
                      Issue logged successfully to tracking timeline.
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
