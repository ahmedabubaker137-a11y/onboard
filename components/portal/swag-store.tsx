"use client";

import React, { useState, useEffect } from "react";
import { Package, Truck, Check, Sparkles, MapPin, CheckCircle2, RefreshCw } from "lucide-react";
import type { SwagOrderItem } from "@/lib/types";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

interface SwagStoreProps {
  employeeId: string;
  employeeName: string;
}

export function SwagStore({ employeeId, employeeName }: SwagStoreProps) {
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [selectedItems, setSelectedItems] = useState<string[]>([
    "Company Welcome Hoodie",
    "Stainless Insulated Tumbler",
    "Die-Cut Laptop Stickers",
    "Canvas Laptop Sleeve",
  ]);
  const [shippingAddress, setShippingAddress] = useState("1842 Market St, Apt 4B, San Francisco, CA 94102");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<SwagOrderItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  const availableItems = [
    { id: "Company Welcome Hoodie", name: "Heavyweight Organic Hoodie", desc: "Slate Pine embroidered with subtle chest logo" },
    { id: "Stainless Insulated Tumbler", name: "20oz Thermal Tumbler", desc: "Double-wall vacuum insulation in matte graphite" },
    { id: "Die-Cut Laptop Stickers", name: "Holographic Vinyl Stickers", desc: "Waterproof tech stack and company crest pack" },
    { id: "Canvas Laptop Sleeve", name: "16-inch Padded Canvas Sleeve", desc: "Fleece-lined with magnetic closure" },
    { id: "Merino Wool Beanie", name: "Merino Knit Beanie", desc: "Warm ribbed knit in heather charcoal" },
    { id: "Field Notes Journal", name: "Hardcover Dot-Grid Notebook", desc: "Custom debossed cover with archival paper" },
  ];

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/v1/swag?employeeId=${employeeId}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.orders) setOrders(json.orders);
      }
    } catch (e) {
      console.error("Failed to load swag orders:", e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const unsubscribe = subscribeToDataChanges((detail) => {
      if (!detail?.type || detail.type === "swag" || detail.type === "focus") {
        fetchOrders();
      }
    });
    return () => unsubscribe();
  }, [employeeId]);

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      if (selectedItems.length > 1) {
        setSelectedItems(selectedItems.filter((i) => i !== itemId));
      }
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/swag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          shirtSize: selectedSize,
          items: selectedItems,
          shippingAddress,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage("Swag pack successfully ordered! Automated fulfillment dispatched to warehouse.");
        notifyDataChanged("swag");
        await fetchOrders();
      } else {
        setStatusMessage(data.error || "Order dispatch failed");
      }
    } catch (err) {
      setStatusMessage("Network error placing swag order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist dark:border-graphite-muted/20 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pine/10 text-pine dark:text-amberSignal">
                <Package className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold font-headline text-graphite dark:text-ivory">
                Official Welcome Swag Store
              </h3>
            </div>
            <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
              Select your complimentary Day 1 apparel and swag kit. Shipped directly via FedEx Priority.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-forest/10 text-forest dark:text-[#38B38A] border border-forest/20 self-start sm:self-auto">
            100% Company Sponsored
          </span>
        </div>

        {statusMessage && (
          <div className="mb-6 p-4 rounded-xl bg-forest/10 border border-forest/30 text-xs text-forest dark:text-[#38B38A] flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleOrderSubmit} className="space-y-6">
          {/* T-Shirt Size Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite dark:text-ivory mb-2">
              1. Choose Apparel Size (Unisex Cut)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    selectedSize === size
                      ? "bg-pine text-ivory border-pine shadow-xs scale-105"
                      : "bg-mist/30 dark:bg-graphite border-mist dark:border-graphite-muted/30 text-graphite dark:text-gray-300 hover:border-pine"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Kit Item Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite dark:text-ivory mb-2">
              2. Included Welcome Kit Items ({selectedItems.length} selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-warmIvory/80 dark:bg-pine/15 border-pine/50 shadow-xs"
                        : "bg-mist/20 dark:bg-graphite/40 border-mist dark:border-graphite-muted/20 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border text-xs shrink-0 ${
                        isSelected
                          ? "bg-pine text-ivory border-pine"
                          : "border-mist dark:border-graphite-muted/50 bg-white dark:bg-graphite"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-graphite dark:text-ivory">{item.name}</h4>
                      <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite dark:text-ivory mb-2">
              3. Home Delivery Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-graphite-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                placeholder="Street Address, City, State, ZIP code"
              />
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
              Customs duties and international shipping pre-cleared by Acme People Operations.
            </p>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-graphite-muted dark:text-gray-400">
              Estimated delivery: <strong>3 business days</strong>
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pine hover:bg-pine/90 text-ivory text-xs font-bold shadow-subtle transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              <span>Confirm & Dispatch Swag Box</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Orders & Tracking History */}
      {orders.length > 0 && (
        <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl p-6 shadow-xs">
          <h4 className="text-sm font-bold font-headline text-graphite dark:text-ivory mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-pine dark:text-amberSignal" />
            <span>Fulfillment & Package Tracking</span>
          </h4>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-pine dark:text-amberSignal">
                      {order.id}
                    </span>
                    <span className="text-xs text-graphite-muted dark:text-gray-400 ml-2">
                      Size: <strong>{order.shirtSize}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-forest/10 text-forest dark:text-[#38B38A] border border-forest/20">
                      {order.status}
                    </span>
                    <span className="text-xs font-mono text-graphite-muted dark:text-gray-400">
                      FedEx: {order.trackingNumber}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(order.items || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-mist/50 dark:bg-graphite-muted/20 text-graphite dark:text-gray-300 text-[11px] font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-graphite-muted dark:text-gray-400 border-t border-mist/80 dark:border-graphite-muted/20 pt-2 flex items-center justify-between">
                  <span>Delivering to: {order.shippingAddress}</span>
                  <span>Est. Delivery: <strong>{order.estimatedDelivery || "May 4, 2026"}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
