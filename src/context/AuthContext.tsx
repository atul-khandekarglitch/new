"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Company, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isRoleTransitioning: boolean;
  roleTransitionStage: "idle" | "fading_out" | "fading_in";
  roleTransitionDirection: "left" | "right";
  roleTransitionError: string | null;
  targetRole: UserRole | null;
  loginAs: (role: UserRole) => Promise<boolean>;
  setUserManual: (user: User, company: Company) => void;
  logout: () => void;
  switchRoleModalOpen: boolean;
  setSwitchRoleModalOpen: (open: boolean) => void;
  clearRoleTransitionError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [switchRoleModalOpen, setSwitchRoleModalOpen] = useState<boolean>(false);

  // Role switching animation states
  const [isRoleTransitioning, setIsRoleTransitioning] = useState<boolean>(false);
  const [roleTransitionStage, setRoleTransitionStage] = useState<"idle" | "fading_out" | "fading_in">("idle");
  const [roleTransitionDirection, setRoleTransitionDirection] = useState<"left" | "right">("right");
  const [roleTransitionError, setRoleTransitionError] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Initial fetch of demo user (default to Buyer)
    fetch("/api/auth?userId=user_buyer_rajesh")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setCompany(data.company);
        }
      })
      .catch((err) => console.error("Auth init error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const loginAs = async (role: UserRole): Promise<boolean> => {
    // Concurrency / Debounce guard: prevent rapid repeated clicks from interfering
    if (isRoleTransitioning) {
      return false;
    }
    if (user?.role === role) {
      return true;
    }

    const prevRole = user?.role || "buyer";
    const roleOrder: Record<UserRole, number> = { buyer: 0, seller: 1, both: 2, admin: 3 };
    const currentOrder = roleOrder[prevRole] ?? 0;
    const targetOrder = roleOrder[role] ?? 1;
    const direction: "left" | "right" = targetOrder >= currentOrder ? "right" : "left";

    setRoleTransitionDirection(direction);
    setTargetRole(role);
    setIsRoleTransitioning(true);
    setRoleTransitionError(null);
    setRoleTransitionStage("fading_out");

    try {
      const apiPromise = fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", role }),
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        return res.json();
      });

      // Phase 1: 140ms fade-out transition
      const [data] = await Promise.all([
        apiPromise,
        new Promise((resolve) => setTimeout(resolve, 140)),
      ]);

      if (data && data.success) {
        // Success: update user and company data
        setUser(data.user);
        setCompany(data.company);
        setRoleTransitionStage("fading_in");

        // Phase 2: 160ms fade-in transition (Total ~300ms)
        await new Promise((resolve) => setTimeout(resolve, 160));

        setRoleTransitionStage("idle");
        setIsRoleTransitioning(false);
        setTargetRole(null);
        return true;
      } else {
        throw new Error(data?.error || "Failed to switch role");
      }
    } catch (err: any) {
      console.error("Role switch failed:", err);
      // Failure state: restore previous role and show error
      setRoleTransitionError(err?.message || "Role switch failed. Reverted to previous mode.");
      setTargetRole(prevRole);
      setRoleTransitionStage("idle");
      setIsRoleTransitioning(false);
      return false;
    }
  };

  const clearRoleTransitionError = () => {
    setRoleTransitionError(null);
  };

  const setUserManual = (newUser: User, newCompany: Company) => {
    setUser(newUser);
    setCompany(newCompany);
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isLoading,
        isRoleTransitioning,
        roleTransitionStage,
        roleTransitionDirection,
        roleTransitionError,
        targetRole,
        loginAs,
        setUserManual,
        logout,
        switchRoleModalOpen,
        setSwitchRoleModalOpen,
        clearRoleTransitionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
