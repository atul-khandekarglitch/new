"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

interface RoleTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function RoleTransitionWrapper({
  children,
  className = "",
}: RoleTransitionWrapperProps) {
  const { roleTransitionStage, roleTransitionDirection } = useAuth();

  // Dynamic CSS classes for smooth fade + subtle horizontal slide (approx 150ms per half-phase)
  let transitionStateClasses = "opacity-100 translate-x-0";

  if (roleTransitionStage === "fading_out") {
    // Subtle horizontal slide in the direction of transition
    const slideOffset = roleTransitionDirection === "right" ? "-translate-x-3" : "translate-x-3";
    transitionStateClasses = `opacity-0 ${slideOffset}`;
  } else if (roleTransitionStage === "fading_in") {
    // Return smoothly to zero offset as it fades in
    transitionStateClasses = "opacity-100 translate-x-0";
  }

  return (
    <div
      className={`role-transition-element transition-all duration-150 ease-out motion-reduce:transition-opacity motion-reduce:transform-none ${transitionStateClasses} ${className}`}
    >
      {children}
    </div>
  );
}
