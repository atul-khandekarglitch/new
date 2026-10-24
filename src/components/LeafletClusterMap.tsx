"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletClusterMapProps {
  clusters: any[];
  selectedCluster: any | null;
  onSelectCluster: (cluster: any) => void;
  showRoutes: boolean;
  tileTheme: "osm" | "voyager" | "dark";
  osrmRoutes: {
    nh48: [number, number][];
    cbic: [number, number][];
    puneRanjangaon: [number, number][];
    puneTriangle: [number, number][];
  };
  routeMetrics: {
    nh48Km: number;
    cbicKm: number;
    puneRanjangaonKm: number;
    puneTriangleKm: number;
  };
  osrmStatus: "live" | "fetching" | "offline";
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  mapCenter: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
}

export default function LeafletClusterMap({
  clusters,
  selectedCluster,
  onSelectCluster,
  showRoutes,
  tileTheme,
  osrmRoutes,
  routeMetrics,
  osrmStatus,
  zoomLevel,
  onZoomChange,
  mapCenter,
  onCenterChange,
}: LeafletClusterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Subcontinent Center: frames Faridabad (North), Pune/Ranjangaon (West), Peenya/Sriperumbudur (South)
      const map = L.map(mapContainerRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: zoomLevel,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false, // Custom styled attribution at bottom
      });

      // Track pan and zoom changes
      map.on("zoomend", () => {
        onZoomChange(map.getZoom());
      });

      map.on("moveend", () => {
        const c = map.getCenter();
        onCenterChange({ lat: c.lat, lng: c.lng });
      });

      // Initialize Tile Layer with OpenStreetMap Standard Raster Tiles (No API key watermarks)
      const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        className: tileTheme === "dark" ? "leaflet-tile-dark" : "",
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Center and Zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    const latDiff = Math.abs(currentCenter.lat - mapCenter.lat);
    const lngDiff = Math.abs(currentCenter.lng - mapCenter.lng);

    if (latDiff > 0.005 || lngDiff > 0.005 || currentZoom !== zoomLevel) {
      map.flyTo([mapCenter.lat, mapCenter.lng], zoomLevel, {
        duration: 0.8,
      });
    }
  }, [mapCenter, zoomLevel]);

  // Sync Tile Theme
  useEffect(() => {
    const tileLayer = tileLayerRef.current;
    if (!tileLayer) return;

    const container = tileLayer.getContainer();
    if (container) {
      if (tileTheme === "dark") {
        container.style.filter = "invert(90%) hue-rotate(190deg) contrast(110%) brightness(85%)";
      } else {
        container.style.filter = "none";
      }
    }
  }, [tileTheme]);

  // Sync Markers and Proximity Clustering (Resolves Overlapping Markers Around Ranjangaon & Pune)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const currentZoom = map.getZoom();

    // Proximity grouping: When zoomed out (zoom <= 7), group nearby hubs in Pune/Ranjangaon
    const isZoomedOut = currentZoom <= 7;
    const processed = new Set<string>();

    clusters.forEach((cluster) => {
      if (processed.has(cluster.id)) return;

      const isRanjangaonOrPune =
        cluster.id.includes("pune") ||
        cluster.id.includes("chakan") ||
        cluster.id.includes("talegaon") ||
        cluster.id.includes("bhosari") ||
        cluster.id.includes("ranjangaon");

      if (isZoomedOut && isRanjangaonOrPune) {
        // Group the 5 Pune-Ranjangaon hubs into a single regional cluster badge
        const puneGroup = clusters.filter(
          (c) =>
            c.id.includes("pune") ||
            c.id.includes("chakan") ||
            c.id.includes("talegaon") ||
            c.id.includes("bhosari") ||
            c.id.includes("ranjangaon")
        );

        puneGroup.forEach((c) => processed.add(c.id));

        const avgLat = puneGroup.reduce((s, c) => s + c.coordinates.lat, 0) / puneGroup.length;
        const avgLng = puneGroup.reduce((s, c) => s + c.coordinates.lng, 0) / puneGroup.length;
        const isGroupSelected = puneGroup.some((c) => selectedCluster?.id === c.id);

        const groupIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div class="cursor-pointer transition-transform hover:scale-105">
              <div class="px-3 py-1.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 border-2 ${
                isGroupSelected
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 ring-4 ring-cyan-300/40"
                  : "bg-slate-900 text-white border-cyan-400/80"
              }">
                <span class="text-sm">🏭</span>
                <span>Pune–Ranjangaon Belt</span>
                <span class="w-5 h-5 rounded-full bg-cyan-300 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  ${puneGroup.length}
                </span>
              </div>
            </div>
          `,
          iconSize: [210, 36],
          iconAnchor: [105, 18],
        });

        const groupMarker = L.marker([avgLat, avgLng], { icon: groupIcon }).addTo(markersLayer);

        groupMarker.on("click", () => {
          map.flyTo([18.70, 73.95], 9, { duration: 0.8 });
          onZoomChange(9);
          onCenterChange({ lat: 18.70, lng: 73.95 });
          if (puneGroup.length > 0) {
            onSelectCluster(puneGroup[0]);
          }
        });

        // Popup for group
        const groupPopupContent = `
          <div style="font-family: inherit; min-width: 220px; color: #0f172a; padding: 4px;">
            <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">Western Maharashtra Belt</div>
            <div style="font-size: 14px; font-weight: 900; margin-top: 2px;">Pune–Ranjangaon Industrial Ecosystem</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">
              5 Mapped Zones: Ranjangaon 5-Star MIDC, Chakan, Talegaon, Bhosari, PCMC
            </div>
            <div style="margin-top: 8px; font-size: 10px; font-weight: bold; color: #059669;">
              Click to zoom in (9x) and inspect individual plant lots
            </div>
          </div>
        `;
        groupMarker.bindPopup(groupPopupContent);
      } else {
        // Individual Cluster Marker
        processed.add(cluster.id);
        const isSelected = selectedCluster?.id === cluster.id;

        const individualIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div class="cursor-pointer transition-transform hover:scale-110">
              <div class="px-2.5 py-1 rounded-full text-xs font-black shadow-xl flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-cyan-400 text-slate-950 border-cyan-300 ring-4 ring-cyan-300/40"
                  : "bg-slate-900 text-white border-cyan-400/60"
              }">
                <span class="text-xs">📍</span>
                <span class="truncate max-w-[130px]">${cluster.name.split(" ")[0]}</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
            </div>
          `,
          iconSize: [140, 32],
          iconAnchor: [70, 16],
        });

        const marker = L.marker([cluster.coordinates.lat, cluster.coordinates.lng], {
          icon: individualIcon,
        }).addTo(markersLayer);

        marker.on("click", () => {
          onSelectCluster(cluster);
        });

        const popupContent = `
          <div style="font-family: inherit; min-width: 220px; color: #0f172a; padding: 4px;">
            <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">${cluster.region} • ${cluster.state}</div>
            <div style="font-size: 13px; font-weight: 900; margin-top: 2px; color: #0f172a;">${cluster.name}</div>
            <div style="font-size: 10px; font-family: monospace; color: #64748b; margin-top: 2px; background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">
              GPS: ${cluster.coordinates.lat.toFixed(4)}°N, ${cluster.coordinates.lng.toFixed(4)}°E
            </div>
            <div style="margin-top: 6px; font-size: 11px; color: #334155;">
              📦 <strong>${cluster.activeListingsCount}</strong> Available Lots • 🏭 <strong>${cluster.platformCompaniesCount || 2}+</strong> Plants
            </div>
            <div style="margin-top: 4px; font-size: 10px; color: #64748b;">
              ${cluster.primaryIndustries.slice(0, 3).join(", ")}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        if (isSelected) {
          marker.openPopup();
        }
      }
    });
  }, [clusters, selectedCluster, zoomLevel]);

  // Sync OSRM Road Routes via Leaflet Polylines
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    if (!routesLayer) return;

    routesLayer.clearLayers();

    if (!showRoutes) return;

    // Route 1: NH-48 Western Freight Spine
    if (osrmRoutes.nh48 && osrmRoutes.nh48.length > 0) {
      L.polyline(osrmRoutes.nh48, {
        color: "#0284c7",
        weight: 6,
        opacity: 0.4,
      }).addTo(routesLayer);

      L.polyline(osrmRoutes.nh48, {
        color: "#38bdf8",
        weight: 2.5,
        opacity: 0.9,
        dashArray: "8, 6",
      }).addTo(routesLayer);
    }

    // Route 2: CBIC Corridor
    if (osrmRoutes.cbic && osrmRoutes.cbic.length > 0) {
      L.polyline(osrmRoutes.cbic, {
        color: "#059669",
        weight: 6,
        opacity: 0.4,
      }).addTo(routesLayer);

      L.polyline(osrmRoutes.cbic, {
        color: "#10b981",
        weight: 2.5,
        opacity: 0.9,
        dashArray: "6, 4",
      }).addTo(routesLayer);
    }

    // Route 3: Pune–Ranjangaon Highway (SH-27)
    if (osrmRoutes.puneRanjangaon && osrmRoutes.puneRanjangaon.length > 0) {
      L.polyline(osrmRoutes.puneRanjangaon, {
        color: "#c084fc",
        weight: 3,
        opacity: 0.9,
        dashArray: "5, 4",
      }).addTo(routesLayer);
    }

    // Route 4: Pune Automotive Triangle
    if (osrmRoutes.puneTriangle && osrmRoutes.puneTriangle.length > 0) {
      L.polyline(osrmRoutes.puneTriangle, {
        color: "#f59e0b",
        weight: 3,
        opacity: 0.9,
        dashArray: "4, 4",
      }).addTo(routesLayer);
    }
  }, [showRoutes, osrmRoutes]);

  return (
    <div className="relative h-[580px] w-full bg-[#081024] overflow-hidden">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" style={{ zIndex: 10 }} />

      {/* Floating Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 bg-navy-950/95 border border-slate-700/80 rounded-2xl p-3.5 text-[11px] text-slate-300 space-y-2 backdrop-blur-md shadow-2xl z-30 pointer-events-auto">
        <div className="font-bold text-white flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Industrial Cluster Corridors</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">Zoom: {zoomLevel}x</span>
        </div>

        {/* Route Legend with OSRM Metrics */}
        <div className="space-y-1 text-[10px] pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#38bdf8] rounded"></span>
              <span>NH-48 Western Spine</span>
            </div>
            <span className="font-mono text-slate-400">{routeMetrics.nh48Km} km</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#10b981] rounded"></span>
              <span>CBIC (Bengaluru–Chennai)</span>
            </div>
            <span className="font-mono text-slate-400">{routeMetrics.cbicKm} km</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#c084fc] rounded"></span>
              <span>SH-27 (Pune–Ranjangaon)</span>
            </div>
            <span className="font-mono text-slate-400">{routeMetrics.puneRanjangaonKm} km</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#f59e0b] rounded"></span>
              <span>Pune Automotive Triangle</span>
            </div>
            <span className="font-mono text-slate-400">{routeMetrics.puneTriangleKm} km</span>
          </div>
        </div>

        {/* Live OSRM Connection Status */}
        <div className="text-[10px] pt-1 border-t border-slate-800 flex items-center justify-between gap-2">
          <span className="text-slate-400">Routing Service:</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              osrmStatus === "live"
                ? "text-emerald-400"
                : osrmStatus === "fetching"
                ? "text-cyan-300"
                : "text-amber-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                osrmStatus === "live"
                  ? "bg-emerald-400 animate-pulse"
                  : osrmStatus === "fetching"
                  ? "bg-cyan-300 animate-pulse"
                  : "bg-amber-400"
              }`}
            ></span>
            <span>{osrmStatus === "live" ? "OSRM Live" : osrmStatus === "fetching" ? "Connecting..." : "GPS Cached"}</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          Center: <span className="font-mono text-slate-200">{mapCenter.lat.toFixed(2)}°N, {mapCenter.lng.toFixed(2)}°E</span>
        </div>
      </div>

      {/* Required OpenStreetMap Attribution (Bottom-Right) */}
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-300 bg-navy-950/85 px-2.5 py-1 rounded-md border border-slate-700/60 backdrop-blur-md z-30 pointer-events-auto">
        Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline text-cyan-300">OpenStreetMap</a> contributors • Leaflet Engine
      </div>
    </div>
  );
}
