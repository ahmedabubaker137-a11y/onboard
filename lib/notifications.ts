"use client";

export type NotificationType = "hardware" | "document" | "employee" | "audit" | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  link?: string;
}

const STORAGE_KEY = "onboardx_enterprise_notifications";

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_01",
    title: "New Hire Onboarding Initialized",
    message: "Tariq Al-Mansoor was successfully provisioned to the Enterprise Sales cohort.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
    type: "employee",
    link: "/employees/emp_tariq_01",
  },
  {
    id: "notif_02",
    title: "Contract Document Pending Signature",
    message: "Proprietary Information & Inventions Agreement (PIIA) requires employee execution.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    read: false,
    type: "document",
    link: "/documents",
  },
  {
    id: "notif_03",
    title: "Hardware Asset In Inventory",
    message: "MacBook Air 15\" M3 (SN: APPL-MBA-5510) is staged for IT hardware assignment.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    read: false,
    type: "hardware",
    link: "/assets",
  },
  {
    id: "notif_04",
    title: "Cryptographic Audit Verified",
    message: "Automated SHA-256 integrity seal recorded in immutable compliance ledger.",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    read: true,
    type: "audit",
    link: "/settings",
  },
];

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent("onboardx-notifications-updated", { detail: notifications }));
  } catch (e) {
    console.error("Failed to save notifications", e);
  }
}

export function addNotification(
  title: string,
  message: string,
  type: NotificationType = "system",
  link?: string
): AppNotification {
  const current = getNotifications();
  const newItem: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    link,
  };
  const updated = [newItem, ...current];
  saveNotifications(updated);
  return newItem;
}

export function markAllNotificationsAsRead() {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function markNotificationAsRead(id: string) {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function clearAllNotifications() {
  saveNotifications([]);
}
