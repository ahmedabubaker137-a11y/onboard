"use client";

import React, { useState, useEffect, useRef } from "react";
import { DollarSign, ChevronDown, Check } from "lucide-react";
import { CURRENCY_RATES } from "@/lib/constants";
import type { CurrencyCode } from "@/lib/types";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

interface CurrencySwitcherProps {
  onCurrencyChange?: (currency: CurrencyCode, rate: number) => void;
  className?: string;
}

export function CurrencySwitcher({ onCurrencyChange, className }: CurrencySwitcherProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActiveCurrency = () => {
    fetch("/api/v1/currency", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.currentCurrency) {
          const currencyKey = data.currentCurrency as CurrencyCode;
          setSelectedCurrency(currencyKey);
          if (onCurrencyChange) {
            const rate = CURRENCY_RATES[currencyKey]?.rate || 1;
            onCurrencyChange(currencyKey, rate);
          }
        }
      })
      .catch((e) => console.error("Failed to load currency:", e));
  };

  useEffect(() => {
    fetchActiveCurrency();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchActiveCurrency();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (code: CurrencyCode) => {
    setSelectedCurrency(code);
    setIsOpen(false);
    const rate = CURRENCY_RATES[code]?.rate || 1;
    if (onCurrencyChange) {
      onCurrencyChange(code, rate);
    }
    try {
      await fetch("/api/v1/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: code }),
      });
      notifyDataChanged("settings", { currency: code });
    } catch (e) {
      console.error("Failed to update currency:", e);
    }
  };

  const currencySymbols: Record<CurrencyCode, string> = {
    USD: "$ USD",
    EUR: "€ EUR",
    GBP: "£ GBP",
    CAD: "CA$ CAD",
    PKR: "Rs. PKR",
    AED: "AED",
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className || ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-mist dark:border-graphite-borderDark bg-white dark:bg-graphite text-xs font-mono font-bold text-graphite dark:text-ivory hover:border-pine dark:hover:border-pine transition-all cursor-pointer shadow-2xs"
        title="Multi-Currency Payroll Prep Switcher"
        aria-expanded={isOpen}
      >
        <DollarSign className="w-3.5 h-3.5 text-forest dark:text-[#38B38A]" />
        <span>{currencySymbols[selectedCurrency] || selectedCurrency}</span>
        <ChevronDown className="w-3 h-3 text-graphite-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-graphite-cardDark border border-mist dark:border-graphite-borderDark shadow-elevation p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-bold text-graphite-muted dark:text-gray-400 uppercase tracking-wider border-b border-mist/80 dark:border-graphite-borderDark">
            Active Payroll Currency
          </div>
          <div className="space-y-0.5 mt-1">
            {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => {
              const isSelected = selectedCurrency === code;
              const rateObj = CURRENCY_RATES[code];

              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-pine text-ivory font-bold shadow-xs"
                      : "hover:bg-mist dark:hover:bg-[#1E2428] text-graphite dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isSelected && <Check className="w-3 h-3 text-ivory" />}
                    <span className="font-medium">{currencySymbols[code]}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80">
                    {code === "USD" ? "1.00" : `x${rateObj.rate}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
