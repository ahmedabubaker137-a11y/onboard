"use client";

export type EventDataType =
  | "task"
  | "employee"
  | "asset"
  | "benefit"
  | "document"
  | "compliance"
  | "survey"
  | "calendar"
  | "swag"
  | "desk"
  | "settings"
  | "org_chart"
  | "ticket"
  | "requisition"
  | "template"
  | "general";

/**
 * Dispatches a cross-feature reactive event across the client application.
 * Any mounted page or component subscribing will immediately refetch its state.
 */
export function notifyDataChanged(type: EventDataType = "general", detail?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("onboardx-data-updated", {
        detail: { type, timestamp: Date.now(), ...detail },
      })
    );
  }
}

/**
 * Subscribes a React component to real-time cross-feature data updates and window focus.
 * Automatically cleans up listeners on unmount.
 */
export function subscribeToDataChanges(callback: (detail?: { type?: string }) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleUpdate = (e: Event) => {
    const custom = e as CustomEvent<{ type?: string }>;
    callback(custom.detail);
  };

  const handleFocus = () => {
    callback({ type: "focus" });
  };

  window.addEventListener("onboardx-data-updated", handleUpdate);
  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("onboardx-data-updated", handleUpdate);
    window.removeEventListener("focus", handleFocus);
  };
}
