"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  Globe,
  Crosshair,
  Route
} from "lucide-react";

// Dynamically import Leaflet map component with ssr: false (prevents "window is not defined")
const LeafletClusterMap = dynamic(() => import("@/components/LeafletClusterMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[580px] w-full bg-[#081024] flex items-center justify-center text-slate-400 text-xs gap-2.5">
      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading OpenStreetMap Cartography & Geographic Tiles...</span>
    </div>
  ),
});

// VERIFIED FALLBACK HIGHWAY WAYPOINTS (Used if OSRM service is temporarily unreachable)
const NH48_FALLBACK_CORRIDOR: [number, number][] = [
  [28.3412, 77.3325], // Sector 58 Faridabad
  [28.2464, 77.0658], // Sohna / KMP Expressway
  [28.3533, 76.9382], // Manesar Industrial Township
  [28.2057, 76.7909], // Dharuhera / Rewari
  [28.0838, 76.5882], // Bawal Industrial Area
  [27.9863, 76.3840], // Neemrana Industrial Zone
  [27.7051, 76.1983], // Kotputli
  [27.3871, 75.9575], // Shahpura
  [26.9124, 75.7873], // Jaipur (Sitapura / VKI)
  [26.5746, 74.8665], // Kishangarh Hub
  [26.4499, 74.6399], // Ajmer bypass
  [25.3407, 74.6313], // Bhilwara
  [24.8887, 74.6269], // Chittorgarh
  [24.5854, 73.7125], // Udaipur (Sukher)
  [23.5979, 72.9698], // Himatnagar
  [23.0225, 72.5714], // Ahmedabad / Sanand
  [22.6916, 72.8634], // Nadiad
  [22.3072, 73.1812], // Vadodara (Makarpura GIDC)
  [21.6264, 73.0031], // Ankleshwar GIDC
  [21.1702, 72.8311], // Surat (Hazira / Sachin GIDC)
  [20.5992, 72.9342], // Valsad
  [20.3712, 72.9042], // Vapi GIDC
  [19.7215, 72.9124], // Manor / Palghar
  [19.2684, 72.9734], // Thane / Ghodbunder
  [19.0330, 73.0297], // Navi Mumbai (TTC MIDC)
  [18.9894, 73.1175], // Panvel (Mumbai-Pune Expressway)
  [18.7884, 73.3444], // Khopoli / Bhor Ghat
  [18.7557, 73.4091], // Lonavala / Khandala
  [18.7342, 73.6741], // Talegaon Industrial Area
  [18.7606, 73.8567], // Chakan MIDC (Phases 1-4)
  [18.6186, 73.8370], // Bhosari MIDC
  [18.6298, 73.7997], // Pune PCMC
  [17.6805, 73.9930], // Satara MIDC
  [17.2885, 74.1844], // Karad
  [16.7380, 74.2720], // Kolhapur / Shiroli MIDC
  [15.8497, 74.4977], // Belagavi (Machhe)
  [15.3647, 75.1240], // Hubballi (Tarihal)
  [14.4644, 75.9218], // Davanagere
  [14.2251, 76.4019], // Chitradurga
  [13.3422, 77.1017], // Tumakuru Industrial Area
  [13.0975, 77.3917], // Nelamangala
  [13.0285, 77.5197], // Bengaluru (Peenya Industrial Area)
];

const CBIC_FALLBACK_CORRIDOR: [number, number][] = [
  [13.0285, 77.5197], // Bengaluru (Peenya)
  [13.0709, 77.7981], // Hoskote Industrial Area
  [13.1554, 78.0163], // Narasapura Industrial Area
  [13.1367, 78.1292], // Kolar
  [13.1633, 78.3942], // Mulbagal
  [13.2000, 78.7500], // Palamaner
  [13.2172, 79.1003], // Chittoor
  [12.9272, 79.3330], // Ranipet SIPCOT
  [12.8342, 79.7036], // Kanchipuram
  [12.9698, 79.9482], // Sriperumbudur Industrial Corridor
  [13.0041, 79.9882], // Irungattukottai SIPCOT
  [13.0983, 80.1620], // Ambattur Industrial Estate
  [13.0827, 80.2707], // Chennai Port
];

const PUNE_RANJANGAON_FALLBACK: [number, number][] = [
  [18.6186, 73.8370], // Bhosari MIDC
  [18.5794, 73.9806], // Wagholi
  [18.6724, 74.1205], // Sanaswadi Industrial Belt
  [18.7051, 74.1683], // Shikrapur
  [18.7758, 74.2412], // Ranjangaon 5-Star MIDC
];

const PUNE_AUTO_TRIANGLE_FALLBACK: [number, number][] = [
  [18.7606, 73.8567], // Chakan MIDC Phase 2
  [18.7420, 73.7840], // Mahalunge Ingale (Chakan Phase 4)
  [18.7342, 73.6741], // Talegaon MIDC
  [18.7180, 73.7250], // Dehu Road
  [18.6298, 73.7997], // Pimpri-Chinchwad PCMC
  [18.6186, 73.8370], // Bhosari MIDC
  [18.7606, 73.8567], // Loop back to Chakan
];

// Centered bounding box midpoint for all Indian industrial locations (Faridabad, Pune, Ranjangaon, Bengaluru, Sriperumbudur)
const SUBCONTINENT_CENTER = { lat: 20.6555, lng: 76.8111 };

export default function ClusterMapPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProcessFilter, setSelectedProcessFilter] = useState("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "buyer" | "seller">("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isLoading, setIsLoading] = useState(true);

  // Map Navigation & Layer State
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(SUBCONTINENT_CENTER);
  const [zoomLevel, setZoomLevel] = useState<number>(5); // 5 = Subcontinent view, 9-11 = Cluster locality
  const [tileTheme, setTileTheme] = useState<"osm" | "voyager" | "dark">("osm"); // Default to standard OpenStreetMap raster tiles
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  // Live OSRM Road Routing State
  const [osrmStatus, setOsrmStatus] = useState<"live" | "fetching" | "offline">("fetching");
  const [osrmRoutes, setOsrmRoutes] = useState<{
    nh48: [number, number][];
    cbic: [number, number][];
    puneRanjangaon: [number, number][];
    puneTriangle: [number, number][];
  }>({
    nh48: NH48_FALLBACK_CORRIDOR,
    cbic: CBIC_FALLBACK_CORRIDOR,
    puneRanjangaon: PUNE_RANJANGAON_FALLBACK,
    puneTriangle: PUNE_AUTO_TRIANGLE_FALLBACK,
  });

  const [routeMetrics, setRouteMetrics] = useState<{
    nh48Km: number;
    cbicKm: number;
    puneRanjangaonKm: number;
    puneTriangleKm: number;
  }>({
    nh48Km: 2119,
    cbicKm: 298,
    puneRanjangaonKm: 64.5,
    puneTriangleKm: 51.4,
  });

  // Deduplicated Stats
  const [stats, setStats] = useState({
    totalOnPlatform: 10,
    verifiedCount: 8,
  });

  // Fetch Clusters from Backend API
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

  // Fetch Real Road-Following Routes from OSRM (Open Source Routing Machine)
  useEffect(() => {
    let isCancelled = false;

    async function fetchOsrmRoutes() {
      setOsrmStatus("fetching");
      try {
        const osrmEndpoints = {
          cbic: "https://router.project-osrm.org/route/v1/driving/77.5197,13.0285;79.9482,12.9698?overview=full&geometries=geojson",
          puneRanjangaon: "https://router.project-osrm.org/route/v1/driving/73.8370,18.6186;74.2412,18.7758?overview=full&geometries=geojson",
          puneTriangle: "https://router.project-osrm.org/route/v1/driving/73.8567,18.7606;73.6741,18.7342;73.8370,18.6186?overview=full&geometries=geojson",
          nh48North: "https://router.project-osrm.org/route/v1/driving/77.3325,28.3412;73.8165,18.6722?overview=full&geometries=geojson",
          nh48South: "https://router.project-osrm.org/route/v1/driving/73.8165,18.6722;77.5197,13.0285?overview=full&geometries=geojson",
        };

        const [resCbic, resRanjangaon, resTriangle, resNh48N, resNh48S] = await Promise.allSettled([
          fetch(osrmEndpoints.cbic).then((r) => r.json()),
          fetch(osrmEndpoints.puneRanjangaon).then((r) => r.json()),
          fetch(osrmEndpoints.puneTriangle).then((r) => r.json()),
          fetch(osrmEndpoints.nh48North).then((r) => r.json()),
          fetch(osrmEndpoints.nh48South).then((r) => r.json()),
        ]);

        if (isCancelled) return;

        let liveCbic = CBIC_FALLBACK_CORRIDOR;
        let liveCbicKm = 298;
        if (resCbic.status === "fulfilled" && resCbic.value.code === "Ok") {
          liveCbic = resCbic.value.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          liveCbicKm = Math.round(resCbic.value.routes[0].distance / 1000);
        }

        let liveRanjangaon = PUNE_RANJANGAON_FALLBACK;
        let liveRanjangaonKm = 64.5;
        if (resRanjangaon.status === "fulfilled" && resRanjangaon.value.code === "Ok") {
          liveRanjangaon = resRanjangaon.value.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          liveRanjangaonKm = Math.round((resRanjangaon.value.routes[0].distance / 100) / 10);
        }

        let liveTriangle = PUNE_AUTO_TRIANGLE_FALLBACK;
        let liveTriangleKm = 51.4;
        if (resTriangle.status === "fulfilled" && resTriangle.value.code === "Ok") {
          liveTriangle = resTriangle.value.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          liveTriangleKm = Math.round((resTriangle.value.routes[0].distance / 100) / 10);
        }

        let liveNh48 = NH48_FALLBACK_CORRIDOR;
        let liveNh48Km = 2119;
        if (
          resNh48N.status === "fulfilled" && resNh48N.value.code === "Ok" &&
          resNh48S.status === "fulfilled" && resNh48S.value.code === "Ok"
        ) {
          const ptsNorth = resNh48N.value.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          const ptsSouth = resNh48S.value.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          liveNh48 = [...ptsNorth, ...ptsSouth];
          liveNh48Km = Math.round((resNh48N.value.routes[0].distance + resNh48S.value.routes[0].distance) / 1000);
        }

        setOsrmRoutes({
          nh48: liveNh48,
          cbic: liveCbic,
          puneRanjangaon: liveRanjangaon,
          puneTriangle: liveTriangle,
        });

        setRouteMetrics({
          nh48Km: liveNh48Km,
          cbicKm: liveCbicKm,
          puneRanjangaonKm: liveRanjangaonKm,
          puneTriangleKm: liveTriangleKm,
        });

        setOsrmStatus("live");
      } catch (err) {
        console.warn("OSRM routing service unavailable, using verified GPS corridors:", err);
        if (!isCancelled) {
          setOsrmStatus("offline");
        }
      }
    }

    fetchOsrmRoutes();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Filter clusters by manufacturing process if selected
  const displayClusters = clusters.filter((c) => {
    if (selectedProcessFilter === "all") return true;
    return c.primaryIndustries.some((ind: string) =>
      ind.toLowerCase().includes(selectedProcessFilter.toLowerCase())
    );
  });

  // Center on a specific cluster smoothly
  const handleSelectCluster = (cluster: any) => {
    setSelectedCluster(cluster);
    setMapCenter({ lat: cluster.coordinates.lat, lng: cluster.coordinates.lng });
    setZoomLevel(9); // Smooth zoom to cluster locality
  };

  // Reset to full view of India fitting all industrial locations
  const handleFitSubcontinent = () => {
    setMapCenter(SUBCONTINENT_CENTER);
    setZoomLevel(5);
  };

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
                Discover localized industrial manufacturing ecosystems, circular exchange corridors, and spatial material flows across India using verified geodetic coordinates and OpenStreetMap.
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

          {/* Stats Bar (Single Source of Truth) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-navy-800 text-xs">
            <div className="bg-navy-900/60 rounded-2xl p-3 border border-navy-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Industrial Corridors</div>
              <div className="text-xl font-black text-white mt-0.5">{clusters.length} Mapped Belts</div>
            </div>
            <div className="bg-navy-900/60 rounded-2xl p-3 border border-navy-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Companies on Platform</div>
              <div className="text-xl font-black text-brand-cyan mt-0.5">{stats.totalOnPlatform} Active Plants</div>
            </div>
            <div className="bg-navy-900/60 rounded-2xl p-3 border border-navy-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Verified Facilities</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.verifiedCount} Verified</div>
            </div>
            <div className="bg-navy-900/60 rounded-2xl p-3 border border-navy-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Routing Intelligence</div>
              <div className="text-xl font-black text-purple-300 mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${osrmStatus === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                <span>{osrmStatus === "live" ? "OSRM Live" : "GPS Cached"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border-b border-slate-200 py-3 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search industrial belt, region, or by-product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs text-slate-900"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {["all", "Foundry", "Machining", "Stamping", "Aerospace"].map((process) => (
                  <button
                    key={process}
                    onClick={() => setSelectedProcessFilter(process)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedProcessFilter === process
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {process === "all" ? "All Processes" : process}
                  </button>
                ))}
              </div>

              {/* Reset Subcontinent Center Button */}
              <button
                onClick={handleFitSubcontinent}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                title="Reset view to all Indian industrial hubs"
              >
                <Crosshair className="w-3.5 h-3.5 text-brand-blue" />
                <span>Fit All Hubs</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Map Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Transparent Ecosystem Notice */}
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-slate-900 block">
              Transparent Regional Ecosystem Disclosure
            </span>
            <p className="text-slate-600 text-[11px]">
              Induscycle coordinates regional circular hubs through verified geodetic anchors and road-based highway freight corridors. OpenStreetMap raster tiles provide verified place names, roads, and topography with zero watermarks.
            </p>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Real Geodetic Leaflet Map Canvas (Col 1-8) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Map Canvas Header & Controls */}
              <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-300" />
                  <span className="font-bold">
                    Geographically Accurate Industrial Map (OpenStreetMap • Leaflet • OSRM)
                  </span>
                </div>
                
                {/* Layer Selector & Controls */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  
                  {/* Tile Style Picker */}
                  <div className="flex bg-slate-800 rounded-lg p-0.5 text-[11px]">
                    <button
                      onClick={() => setTileTheme("osm")}
                      className={`px-2 py-1 rounded font-bold transition-all ${
                        tileTheme === "osm" ? "bg-brand-blue text-white" : "text-slate-400 hover:text-white"
                      }`}
                      title="OpenStreetMap Standard Full-Color Cartography"
                    >
                      OSM
                    </button>
                    <button
                      onClick={() => setTileTheme("voyager")}
                      className={`px-2 py-1 rounded font-bold transition-all ${
                        tileTheme === "voyager" ? "bg-brand-blue text-white" : "text-slate-400 hover:text-white"
                      }`}
                      title="Streets & Road Network View"
                    >
                      Streets
                    </button>
                    <button
                      onClick={() => setTileTheme("dark")}
                      className={`px-2 py-1 rounded font-bold transition-all ${
                        tileTheme === "dark" ? "bg-brand-blue text-white" : "text-slate-400 hover:text-white"
                      }`}
                      title="High-Contrast Industrial Dark Navigation View"
                    >
                      Dark
                    </button>
                  </div>

                  {/* Toggle Highway Corridors */}
                  <button
                    onClick={() => setShowRoutes(!showRoutes)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                      showRoutes
                        ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                    title="Toggle Highway Freight Corridors"
                  >
                    <Route className="w-3 h-3" />
                    <span>Freight Corridors</span>
                  </button>

                  {/* Zoom Controls */}
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(14, z + 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Zoom In (Road Level)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(4, z - 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleFitSubcontinent}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    title="Fit Subcontinent View (India)"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Leaflet Interactive Map */}
              <LeafletClusterMap
                clusters={displayClusters}
                selectedCluster={selectedCluster}
                onSelectCluster={handleSelectCluster}
                showRoutes={showRoutes}
                tileTheme={tileTheme}
                osrmRoutes={osrmRoutes}
                routeMetrics={routeMetrics}
                osrmStatus={osrmStatus}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                mapCenter={mapCenter}
                onCenterChange={setMapCenter}
              />

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
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      GPS: {selectedCluster.coordinates.lat.toFixed(4)}° N, {selectedCluster.coordinates.lng.toFixed(4)}° E
                    </div>
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

                  {/* Quick Center on Map Button */}
                  <button
                    onClick={() => handleSelectCluster(selectedCluster)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Focus Real Map on this Cluster (Zoom 9x)</span>
                  </button>

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

                  {/* Platform Registered Companies in this Hub */}
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
