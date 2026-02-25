"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type ColorMode = "full" | "16" | "8";

// A fixed 16-colour palette (approximate web-safe-ish colours)
const PALETTE_16: [number, number, number][] = [
  [0, 0, 0],       // black
  [255, 255, 255], // white
  [128, 0, 0],     // maroon
  [255, 0, 0],     // red
  [128, 128, 0],   // olive
  [255, 255, 0],   // yellow
  [0, 128, 0],     // green
  [0, 255, 0],     // lime
  [0, 128, 128],   // teal
  [0, 255, 255],   // cyan
  [0, 0, 128],     // navy
  [0, 0, 255],     // blue
  [128, 0, 128],   // purple
  [255, 0, 255],   // fuchsia
  [128, 128, 128], // gray
  [192, 192, 192], // silver
];

const PALETTE_8: [number, number, number][] = [
  [0, 0, 0],
  [255, 255, 255],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
];

function nearestColor(r: number, g: number, b: number, palette: [number, number, number][]): [number, number, number] {
  let best = palette[0];
  let bestDist = Infinity;
  for (const [pr, pg, pb] of palette) {
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = [pr, pg, pb];
    }
  }
  return best;
}

const PIXEL_SIZES = [4, 8, 16, 32] as const;
type PixelSize = typeof PIXEL_SIZES[number];

export default function PixelArt({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [pixelSize, setPixelSize] = useState<PixelSize>(8);
  const [colorMode, setColorMode] = useState<ColorMode>("full");
  const [hasImage, setHasImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const renderPixelArt = useCallback(() => {
    const img = sourceImageRef.current;
    const hidden = hiddenCanvasRef.current;
    const output = outputCanvasRef.current;
    if (!img || !hidden || !output) return;

    const MAX = 300;
    const aspect = img.naturalWidth / img.naturalHeight;

    // Output canvas size: max 300px wide
    const outW = Math.min(MAX, img.naturalWidth);
    const outH = Math.round(outW / aspect);

    // Number of pixel blocks
    const blocksX = Math.ceil(outW / pixelSize);
    const blocksY = Math.ceil(outH / pixelSize);

    // Draw source image to hidden canvas at block resolution
    hidden.width = blocksX;
    hidden.height = blocksY;
    const hCtx = hidden.getContext("2d");
    if (!hCtx) return;
    hCtx.imageSmoothingEnabled = true;
    hCtx.clearRect(0, 0, blocksX, blocksY);
    hCtx.drawImage(img, 0, 0, blocksX, blocksY);

    // Get pixel data from hidden canvas
    const imageData = hCtx.getImageData(0, 0, blocksX, blocksY);
    const data = imageData.data;

    // Scale output canvas
    const scaledW = blocksX * pixelSize;
    const scaledH = blocksY * pixelSize;
    output.width = scaledW;
    output.height = scaledH;
    const oCtx = output.getContext("2d");
    if (!oCtx) return;
    oCtx.imageSmoothingEnabled = false;

    const palette = colorMode === "16" ? PALETTE_16 : colorMode === "8" ? PALETTE_8 : null;

    for (let y = 0; y < blocksY; y++) {
      for (let x = 0; x < blocksX; x++) {
        const idx = (y * blocksX + x) * 4;
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];
        const a = data[idx + 3];

        if (palette) {
          [r, g, b] = nearestColor(r, g, b, palette);
        }

        oCtx.fillStyle = `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`;
        oCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }, [pixelSize, colorMode]);

  // Re-render when settings change
  useEffect(() => {
    if (hasImage) renderPixelArt();
  }, [pixelSize, colorMode, hasImage, renderPixelArt]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        sourceImageRef.current = img;
        setHasImage(true);
        // renderPixelArt will be triggered by the hasImage state change
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Trigger render after image loads (hasImage changes to true)
  useEffect(() => {
    if (hasImage) {
      // Use rAF to ensure canvas is in DOM
      requestAnimationFrame(() => renderPixelArt());
    }
  }, [hasImage, renderPixelArt]);

  const download = () => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "pixel-art.png";
    a.click();
  };

  return (
    <TemplateShell config={config} icon="🕹️">
      <div className="p-4">
        {/* Upload */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: color }}
          >
            {hasImage ? "Upload new photo" : "Upload photo"}
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-2">Pixel size</label>
            <div className="flex gap-1">
              {PIXEL_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setPixelSize(s)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    backgroundColor: pixelSize === s ? color : `${color}10`,
                    color: pixelSize === s ? "white" : color,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-medium mb-2">Colours</label>
            <div className="flex gap-1">
              {([["full", "Full"], ["16", "16"], ["8", "8"]] as [ColorMode, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setColorMode(id)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    backgroundColor: colorMode === id ? color : `${color}10`,
                    color: colorMode === id ? "white" : color,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden processing canvas */}
        <canvas ref={hiddenCanvasRef} className="hidden" />

        {/* Output canvas */}
        {hasImage ? (
          <div className="space-y-3">
            <div
              className="rounded-2xl overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200"
              style={{ minHeight: "200px" }}
            >
              <canvas
                ref={outputCanvasRef}
                className="max-w-full"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <button
              onClick={download}
              className="w-full py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95"
              style={{ borderColor: color, color }}
            >
              Download PNG
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px dashed ${color}30` }}
          >
            <p className="text-4xl mb-2">🕹️</p>
            <p className="text-gray-500 text-sm font-medium">Upload a photo to pixelate it</p>
            <p className="text-gray-400 text-xs mt-1">Works entirely in your browser — no upload needed</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-3">Works entirely in your browser — no upload needed</p>
      </div>
    </TemplateShell>
  );
}
