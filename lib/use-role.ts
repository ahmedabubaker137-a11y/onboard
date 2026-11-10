"use client";

import { useState, useEffect, useCallback } from "react";
import { DEMO_USERS, RoleType, CurrentUser, PERMISSIONS, hasPermission } from "./rbac";
import { addNotification } from "./notifications";

export function useRole() {
  const [currentRole, setCurrentRole] = useState<RoleType>("HR_MANAGER");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or backend
  useEffect(() => {
    const saved = localStorage.getItem("onboardx_current_role") as RoleType;
    if (saved && DEMO_USERS[saved]) {
      setCurrentRole(saved);
      setIsLoading(false);
    } else {
      // Fetch from API
      fetch("/api/auth/role")
        .then((res) => res.json())
        .then((data) => {
          if (data.role && DEMO_USERS[data.role as RoleType]) {
            setCurrentRole(data.role);
            localStorage.setItem("onboardx_current_role", data.role);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }

    const handleRoleChanged = (e: Event) => {
      const custom = e as CustomEvent<RoleType>;
      if (custom.detail && DEMO_USERS[custom.detail]) {
        setCurrentRole(custom.detail);
      }
    };

    window.addEventListener("onboardx-role-changed", handleRoleChanged);
    return () => window.removeEventListener("onboardx-role-changed", handleRoleChanged);
  }, []);

  const switchRole = useCallback(async (newRole: RoleType) => {
    if (!DEMO_USERS[newRole]) return;

    setCurrentRole(newRole);
    localStorage.setItem("onboardx_current_role", newRole);

    // Sync with backend API & cookie
    try {
      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (e) {
      console.error("Failed to sync role with backend", e);
    }

    const user = DEMO_USERS[newRole];

    // Push notification into enterprise event stream
    addNotification(
      "Persona Switched",
      `Active persona is now ${user.name} (${newRole.replace("_", " ")}). System privileges updated.`,
      "system"
    );

    // Dispatch global event for all listeners
    window.dispatchEvent(new CustomEvent("onboardx-role-changed", { detail: newRole }));
  }, []);

  const currentUser: CurrentUser = DEMO_USERS[currentRole];

  const can = useCallback(
    (permKey: keyof typeof PERMISSIONS) => hasPermission(currentRole, permKey),
    [currentRole]
  );

  return {
    currentRole,
    currentUser,
    switchRole,
    can,
    isLoading,
  };
}
