"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { IndustrialCluster, Company } from "@/types";
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers, 
  Building2, 
  Truck, 
  Sparkles, 
  Compass, 
  List, 
  Map as MapIcon, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Factory,
  Info,
  Navigation,
  Globe
} from "lucide-react";

export default function ClusterMapPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProcessFilter, setSelectedProcessFilter] = useState("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "buyer" | "seller">("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalOnPlatform: 10,
    verifiedCount: 8,
  });

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedRoleFilter !== "all") params.set("role", selectedRoleFilter);

    fetch(`/api/clusters?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.clusters) {
          setClusters(data.clusters);
          if (data.allCompanies) {
            setAllCompanies(data.allCompanies);
            setStats({
              totalOnPlatform: data.totalCompaniesOnInduscycle || data.allCompanies.length,
              verifiedCount: data.verifiedCompaniesCount || data.allCompanies.filter((c: Company) => c.verified).length,
            });
          }
          if (!selectedCluster && data.clusters.length > 0) {
            setSelectedCluster(data.clusters[0]);
          } else if (selectedCluster) {
            const found = data.clusters.find((c: any) => c.id === selectedCluster.id);
            if (found) setSelectedCluster(found);
          }
        }
      })
      .catch((err) => console.error("Clusters fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedCategory, selectedRoleFilter]);

  // Compute deduplicated company counts (Single Source of Truth)
  const visibleClusterIds = new Set(clusters.map(c => c.id));
  const uniqueCompaniesInVisibleClusters = new Set<string>();
  clusters.forEach(c => {
    if (c.companies) {
      c.companies.forEach((comp: Company) => uniqueCompaniesInVisibleClusters.add(comp.id));
    }
  });

  // Filter clusters by manufacturing process if selected
  const displayClusters = clusters.filter(c => {
    if (selectedProcessFilter === "all") return true;
    return c.primaryIndustries.some((ind: string) => 
      ind.toLowerCase().includes(selectedProcessFilter.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-cyan/20 text-cyan-300 border border-brand-cyan/30 mb-2">
                <Globe className="w-3 h-3" />
                <span>Section 43 • Google Maps-Style Industrial Cluster Map</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Industrial Cluster Map &amp; Spatial Exchange
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Discover localized industrial manufacturing ecosystems, circular exchange corridors, and spatial material flows across India.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex bg-navy-900 rounded-xl p-1 border border-navy-700 text-xs">
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === "map" ? "bg-brand-blue text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Google Maps View</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === "list" ? "bg-brand-purple text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Directory List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, hub (Chakan, Peenya, Bhosari)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-navy-900/90 border border-navy-700 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-navy-900/90 border border-navy-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">All Material Streams</option>
                <option value="Steel">Steel &amp; Sheet-metal Scrap</option>
                <option value="CNC">CNC Machining Turnings</option>
                <option value="Forging">Forging Flash &amp; Billet Cut-offs</option>
                <option value="Aluminium">Aluminium Billets &amp; Non-Ferrous</option>
                <option value="Tool">Tool Steel &amp; Carbide</option>
                <option value="Brass">Copper &amp; Brass Needle Chips</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedProcessFilter}
                onChange={(e) => setSelectedProcessFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-navy-900/90 border border-navy-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">All Manufacturing Processes</option>
                <option value="Forging">Drop Hammer &amp; Press Forging</option>
                <option value="Machining">5-Axis CNC Milling &amp; Turning</option>
                <option value="Laser">Fiber Laser Cutting &amp; Stamping</option>
                <option value="Smelting">Secondary Induction Smelting</option>
                <option value="Fabrication">Heavy Plate Rolling &amp; SAW</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs bg-navy-900/90 border border-navy-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue font-semibold"
              >
                <option value="all">All Trade Roles</option>
                <option value="seller">Suppliers / Sellers</option>
                <option value="buyer">Intake Buyers</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Deduplicated Company Counts Summary (Mandated Single Source of Truth) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Companies on Platform
            </span>
            <div className="text-xl font-black text-slate-900">
              {stats.totalOnPlatform}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Deduplicated enterprise entities
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-blue block tracking-wider">
              Visible in Map View
            </span>
            <div className="text-xl font-black text-brand-blue">
              {uniqueCompaniesInVisibleClusters.size}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              In current cluster zones
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-600 block tracking-wider">
              Matching Active Filters
            </span>
            <div className="text-xl font-black text-cyan-700">
              {displayClusters.length} Hubs
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Sectors &amp; materials aligned
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
              Verified Plants
            </span>
            <div className="text-xl font-black text-emerald-700">
              {stats.verifiedCount}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              On-site audited facilities
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-600 block tracking-wider">
              Pilot &amp; Demo Entities
            </span>
            <div className="text-xl font-black text-purple-700">
              {Math.max(2, stats.totalOnPlatform - stats.verifiedCount)}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Simulated &amp; sandbox plants
            </div>
          </div>

        </div>

        {/* Transparent Disclosure Notice (Mandated) */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-bold block">
              Transparent Regional Ecosystem Disclosure:
            </span>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Induscycle currently maps <strong>{stats.totalOnPlatform} platform-verified supplier &amp; buyer enterprises</strong> across <strong>{clusters.length} major manufacturing corridors</strong> (Pune–Chakan–Bhosari, Peenya Bengaluru, Sriperumbudur Chennai, and Sector 58 Faridabad). These pilot facilities operate within an estimated <strong>12,000+ total regional manufacturing enterprises</strong> in Maharashtra, Karnataka, Tamil Nadu, and Delhi-NCR.
            </p>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Google Maps-Style Canvas (Col 1-8) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Map Canvas Header & Controls */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-300" />
                  <span className="font-bold">Indian Manufacturing Corridor Spatial Map (Google Maps Geodetic Grid)</span>
                </div>
                
                {/* Pan & Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.25))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(Math.max(0.75, zoomLevel - 0.25))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Reset Map View"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Vector Geo Spatial Canvas */}
              <div className="relative h-[560px] w-full bg-[#081024] overflow-hidden select-none">
                
                {/* Subtle Coordinate Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none"></div>

                {/* Regional Contour Vectors & Road Corridors */}
                <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 800 600">
                  {/* Western Corridor Highway (NH-48) */}
                  <path d="M 280,180 Q 260,280 290,360 T 320,480" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* Northern Corridor (Delhi-Faridabad) */}
                  <path d="M 320,120 L 350,150" fill="none" stroke="#a855f7" strokeWidth="3" />
                  {/* Southern Corridors (Bengaluru-Chennai) */}
                  <path d="M 320,480 Q 400,490 480,510" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* Landmass Outlines */}
                  <path d="M 180,80 Q 280,60 380,100 T 560,160 T 640,300 T 520,460 T 320,540 T 180,420 Z" fill="#0f1f3d" stroke="#1e3a8a" strokeWidth="1.5" />
                </svg>

                {/* Cluster Markers */}
                <div 
                  className="absolute inset-0 transition-transform duration-300"
                  style={{ 
                    transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`, 
                    transformOrigin: "center center" 
                  }}
                >
                  {displayClusters.map((cluster) => {
                    const minLat = 12.0;
                    const maxLat = 29.0;
                    const minLng = 72.0;
                    const maxLng = 81.0;

                    const yPercent = 100 - ((cluster.coordinates.lat - minLat) / (maxLat - minLat)) * 80 - 10;
                    const xPercent = ((cluster.coordinates.lng - minLng) / (maxLng - minLng)) * 80 + 10;

                    const isSelected = selectedCluster?.id === cluster.id;

                    return (
                      <div
                        key={cluster.id}
                        onClick={() => setSelectedCluster(cluster)}
                        style={{ top: `${yPercent}%`, left: `${xPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      >
                        {/* Ping radar effect when selected */}
                        {isSelected && (
                          <div className="absolute -inset-2 rounded-full bg-cyan-400 opacity-75 animate-ping"></div>
                        )}

                        <div className={`px-3 py-1.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-cyan-400 text-slate-950 scale-110 ring-4 ring-cyan-300/40"
                            : "bg-navy-900/90 text-white border border-cyan-400/40 hover:scale-105 hover:bg-brand-blue"
                        }`}>
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-slate-950" : "text-cyan-300"}`} />
                          <span className="truncate max-w-[120px]">{cluster.name.split(" ")[0]}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>

                        {/* Hover Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block bg-navy-950 text-white text-[10px] py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-30 pointer-events-none border border-slate-700">
                          <div className="font-bold">{cluster.name}</div>
                          <div className="text-slate-400">{cluster.activeListingsCount} listings • {cluster.estimatedCompaniesCount}+ plants</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map Floating Legend (Bottom-Left) */}
                <div className="absolute bottom-4 left-4 bg-navy-950/90 border border-slate-700/80 rounded-2xl p-3.5 text-[11px] text-slate-300 space-y-1.5 backdrop-blur-md shadow-xl">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <span>Industrial Cluster Spatial Hub</span>
                  </div>
                  <div className="text-slate-400">Showing {displayClusters.length} mapped manufacturing belts</div>
                  <div className="flex items-center gap-3 text-[10px] pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Verified Plant</span>
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <span>Pilot Node</span>
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Selected Cluster Details & Company Directory Panel (Col 9-12) */}
            <div className="lg:col-span-4 space-y-4">
              {selectedCluster ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
                  
                  {/* Cluster Title */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                      {selectedCluster.region} • {selectedCluster.state}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      {selectedCluster.name}
                    </h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      {selectedCluster.description}
                    </p>
                  </div>

                  {/* Cluster Statistics */}
                  <div className="grid grid-cols-3 gap-2 text-center py-3 px-2 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-black text-slate-900 text-sm">{selectedCluster.activeListingsCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Listings</div>
                    </div>
                    <div>
                      <div className="font-black text-brand-blue text-sm">{selectedCluster.activeBuyersCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Buyers</div>
                    </div>
                    <div>
                      <div className="font-black text-emerald-600 text-sm">{selectedCluster.estimatedCompaniesCount}+</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Ecosystem</div>
                    </div>
                  </div>

                  {/* Primary Manufacturing Sectors */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 block">Primary Manufacturing Sectors:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCluster.primaryIndustries.map((ind: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Generated Materials */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 block">Available By-Products in Hub:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCluster.keyMaterialsGenerated.map((mat: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-brand-blue font-semibold text-[11px] border border-blue-100">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Platform Registered Companies in this Hub (Mandated) */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Platform Companies in Hub:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {selectedCluster.companies ? selectedCluster.companies.length : 0} registered
                      </span>
                    </div>

                    {selectedCluster.companies && selectedCluster.companies.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCluster.companies.map((comp: Company) => (
                          <div
                            key={comp.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{comp.name}</span>
                              {comp.verified && (
                                <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {comp.industry} • {comp.manufacturingProcess}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-400 text-center border border-slate-200">
                        Tier-1 pilot onboarding scheduled for this industrial hub.
                      </div>
                    )}
                  </div>

                  {/* Active Verified Material Lots in Area */}
                  {selectedCluster.actualListings && selectedCluster.actualListings.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-900 block">Verified Lots Ready for Intake:</span>
                      <div className="space-y-1.5">
                        {selectedCluster.actualListings.map((l: any) => (
                          <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-900 truncate max-w-[170px]">{l.title}</div>
                              <div className="text-[10px] text-slate-500">{l.quantity} • {l.price}</div>
                            </div>
                            <Link
                              href={`/listings/${l.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] hover:bg-brand-blue transition-colors"
                            >
                              Inspect
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA to Marketplace */}
                  <div className="pt-2">
                    <Link
                      href={`/marketplace?location=${encodeURIComponent(selectedCluster.name.split(" ")[0])}`}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Materials in {selectedCluster.name.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
                  Select any industrial cluster marker on the map to inspect regional materials and localized exchange opportunities.
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Directory List View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                      {cluster.region} • {cluster.state}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Est. {cluster.establishedYear || "Industrial Belt"}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900">{cluster.name}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{cluster.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Available Materials:</span>
                      <span className="text-slate-800 font-semibold">{cluster.keyMaterialsGenerated.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Intake Demand:</span>
                      <span className="text-slate-800 font-semibold">{cluster.keyMaterialsDemanded.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900">{cluster.activeListingsCount}</strong> active lots •{" "}
                    <strong className="text-brand-blue">{cluster.estimatedCompaniesCount}+</strong> plants
                  </div>

                  <Link
                    href={`/marketplace?location=${encodeURIComponent(cluster.name.split(" ")[0])}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-blue text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>View Listings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
