"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Company, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => Promise<void>;
  setUserManual: (user: User, company: Company) => void;
  logout: () => void;
  switchRoleModalOpen: boolean;
  setSwitchRoleModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [switchRoleModalOpen, setSwitchRoleModalOpen] = useState<boolean>(false);

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

  const loginAs = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", role }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setCompany(data.company);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
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
        loginAs,
        setUserManual,
        logout,
        switchRoleModalOpen,
        setSwitchRoleModalOpen,
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
