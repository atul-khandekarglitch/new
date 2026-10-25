"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Package, 
  Truck, 
  CreditCard, 
  Search, 
  MessageSquare, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  eventType: string;
  referenceId?: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  isMobile?: boolean;
}

export default function NotificationCenter({ isMobile = false }: NotificationCenterProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications for the active user
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  // Initial fetch and auto-refresh polling (every 8s + on window focus)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 8000);

    const handleFocus = () => {
      fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user?.id]);

  // Click outside to close panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!user?.id) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_read",
          notificationId,
          userId: user.id,
        }),
      });
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    setIsLoading(true);
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_all_read",
          userId: user.id,
        }),
      });
    } catch (err) {
      console.error("Mark all as read error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Click notification to navigate
  const handleNotificationClick = (item: PortalNotification) => {
    if (!item.read && user?.id) {
      handleMarkAsRead({ stopPropagation: () => {} } as any, item.id);
    }
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  // Relative time helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 45) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  // Icon selector per event type
  const getEventIcon = (eventType: string) => {
    if (eventType.startsWith("order")) {
      return { icon: Package, bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    }
    if (eventType.startsWith("shipment")) {
      return { icon: Truck, bg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
    }
    if (eventType.startsWith("invoice") || eventType === "order_paid") {
      return { icon: CreditCard, bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    }
    if (eventType.startsWith("disclosure")) {
      return { icon: Search, bg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" };
    }
    if (eventType.startsWith("enquiry")) {
      return { icon: MessageSquare, bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    }
    return { icon: Sparkles, bg: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
  };

  const displayedNotifications =
    activeTab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="relative inline-block" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center rounded-lg transition-all focus:outline-none ${
          isMobile
            ? "w-9 h-9 bg-white/10 text-slate-200 hover:text-white hover:bg-white/15"
            : "w-9 h-9 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white"
        } ${isOpen ? "ring-2 ring-brand-cyan/60 bg-white/20 text-white" : ""}`}
        aria-label="Notifications"
        title="Portal Notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-navy-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          className={`z-50 rounded-2xl bg-navy-900/98 backdrop-blur-2xl border border-navy-700/80 shadow-2xl overflow-hidden transition-all duration-150 animate-in fade-in zoom-in-95 ${
            isMobile
              ? "fixed left-3 right-3 top-20 max-w-sm mx-auto text-xs"
              : "absolute right-0 mt-2.5 w-96 text-xs"
          }`}
          style={{ maxHeight: "calc(100vh - 110px)" }}
        >
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-navy-800/80 bg-navy-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-cyan border border-brand-blue/30">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold text-brand-cyan hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-2.5 pb-2 border-b border-navy-800/60 flex items-center gap-2 bg-navy-900/60">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === "unread"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-navy-800/60 overscroll-contain">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-navy-800 flex items-center justify-center text-slate-400 border border-navy-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-cyan" />
                </div>
                <div className="font-semibold text-slate-200 text-sm">You&apos;re all caught up</div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                  {activeTab === "unread"
                    ? "No unread alerts for your account."
                    : "Important activity regarding orders, shipments, and payments will appear here."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((item) => {
                const { icon: EventIcon, bg: iconStyle } = getEventIcon(item.eventType);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group px-4 py-3 flex items-start gap-3 cursor-pointer transition-all ${
                      item.read
                        ? "bg-navy-900/40 hover:bg-white/[0.04] text-slate-300"
                        : "bg-navy-800/40 hover:bg-navy-800/70 text-white border-l-2 border-brand-cyan"
                    }`}
                  >
                    {/* Event Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border mt-0.5 ${iconStyle}`}
                    >
                      <EventIcon className="w-4 h-4" />
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white text-xs truncate group-hover:text-brand-cyan transition-colors">
                          {item.title}
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-brand-cyan group-hover:underline">
                          <span>View Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Mark Single as Read Action */}
                    {!item.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-brand-cyan transition-all mt-0.5"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Footer */}
          <div className="px-4 py-2.5 bg-navy-950/80 border-t border-navy-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Live portal alerts active</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(user?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer");
              }}
              className="text-brand-cyan hover:text-white font-medium transition-colors"
            >
              Portal Dashboard &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
