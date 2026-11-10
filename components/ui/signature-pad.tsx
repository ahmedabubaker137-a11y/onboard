"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "./button";
import { generateCryptoHash } from "@/lib/audit";
import { CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";

interface SignaturePadProps {
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  onSignComplete: (signatureHash: string, signatureSvg: string) => void;
  isCompleted?: boolean;
  existingHash?: string;
}

export function SignaturePad({
  documentTitle,
  signerName,
  signerEmail,
  onSignComplete,
  isCompleted = false,
  existingHash,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signedState, setSignedState] = useState(isCompleted);
  const [stampHash, setStampHash] = useState(existingHash || "");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;

    const isDark = document.documentElement.classList.contains("dark");
    ctx.strokeStyle = isDark ? "#38B38A" : "#274C4A"; // Forest contrast or Slate Pine ink
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (signedState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains("dark");
    ctx.strokeStyle = isDark ? "#38B38A" : "#274C4A";

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signedState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL("image/png");
    const payload = {
      documentTitle,
      signerName,
      signerEmail,
      timestamp: new Date().toISOString(),
      rawSignatureSnippet: dataUrl.substring(0, 100),
    };
    const hash = generateCryptoHash(payload);
    setStampHash(hash);
    setSignedState(true);
    onSignComplete(hash, dataUrl);
  };

  if (signedState) {
    return (
      <div className="rounded-xl border border-forest/30 dark:border-forest/40 bg-forest/5 dark:bg-forest/15 p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-forest dark:text-[#38B38A] font-headline font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>Legally Binding Electronic Signature Applied</span>
        </div>
        <div className="text-xs text-graphite dark:text-ivory space-y-1">
          <p><span className="font-semibold">Signer:</span> {signerName} ({signerEmail})</p>
          <p><span className="font-semibold">Document:</span> {documentTitle}</p>
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-graphite-muted dark:text-gray-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>SHA-256 Audit Stamp: {stampHash.substring(0, 24)}...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-[#1A1F22] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold font-headline text-graphite dark:text-ivory">
            Signer Verification: {signerName}
          </h4>
          <p className="text-xs text-graphite-muted dark:text-gray-400">
            Draw your signature below using mouse or touchscreen to formally accept.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={!hasDrawn}
          className="text-xs text-graphite-muted dark:text-gray-400 hover:text-brick"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Clear Pad
        </Button>
      </div>

      <div className="relative border border-dashed border-pine/40 dark:border-pine/60 rounded-lg bg-[#FAFBFB] dark:bg-[#15191C] h-36 flex items-center justify-center overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
        {!hasDrawn && (
          <div className="pointer-events-none absolute text-xs text-graphite-muted/60 dark:text-gray-500 select-none">
            Click and drag to write signature here
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-graphite-muted dark:text-gray-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
          Tamper-evident audit stamp will be cryptographically generated upon signing.
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSign}
          disabled={!hasDrawn}
        >
          Confirm & Stamp Signature
        </Button>
      </div>
    </div>
  );
}
