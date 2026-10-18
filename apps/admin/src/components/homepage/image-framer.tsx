'use client';

import { useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEFAULT_FRAME, HERO_MAX_ZOOM, type ImageFrame } from '@/types/homepage';

const KEY_STEP = 2; // % per arrow key press (Shift = ×5)

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round = (v: number) => Math.round(v * 10) / 10;

/** Same CSS the storefront applies — see apps/web/src/components/home/hero-slide.tsx */
export const frameStyle = (f: ImageFrame): CSSProperties => ({
  objectPosition: `${f.x}% ${f.y}%`,
  transform: f.zoom > 1 ? `scale(${f.zoom})` : undefined,
  transformOrigin: `${f.x}% ${f.y}%`,
});

interface ImageFramerProps {
  src: string;
  value: ImageFrame;
  onChange: (frame: ImageFrame) => void;
  variant: 'desktop' | 'mobile';
  label: string;
}

// Drag the image to choose what the hero frame shows; zoom to crop tighter.
// Nothing is cut from the file — the storefront applies the same
// object-position / scale, so it can be re-framed any time.
export function ImageFramer({ src, value, onChange, variant, label }: ImageFramerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; from: ImageFrame } | null>(null);
  const [dragging, setDragging] = useState(false);

  const set = (next: Partial<ImageFrame>) => {
    const merged = { ...value, ...next };
    onChange({
      x: round(clamp(merged.x, 0, 100)),
      y: round(clamp(merged.y, 0, 100)),
      zoom: Math.round(clamp(merged.zoom, 1, HERO_MAX_ZOOM) * 100) / 100,
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, from: value };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    // Dragging right reveals more of the left side → focal x decreases.
    // Zoomed in, the same drag covers less of the image.
    const dx = ((e.clientX - d.startX) / rect.width) * 100 / d.from.zoom;
    const dy = ((e.clientY - d.startY) / rect.height) * 100 / d.from.zoom;
    set({ x: d.from.x - dx, y: d.from.y - dy });
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? KEY_STEP * 5 : KEY_STEP;
    const moves: Record<string, Partial<ImageFrame>> = {
      ArrowLeft: { x: value.x + step },
      ArrowRight: { x: value.x - step },
      ArrowUp: { y: value.y + step },
      ArrowDown: { y: value.y - step },
      '+': { zoom: value.zoom + 0.1 },
      '=': { zoom: value.zoom + 0.1 },
      '-': { zoom: value.zoom - 0.1 },
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    set(move);
  };

  const isDefault = value.x === 50 && value.y === 50 && value.zoom === 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onChange({ ...DEFAULT_FRAME })}
          disabled={isDefault}
        >
          <RotateCcw className="mr-1.5 h-3 w-3" />
          Reset
        </Button>
      </div>

      <div
        ref={frameRef}
        role="group"
        tabIndex={0}
        aria-label={`${label}: drag or use arrow keys to reposition, + and − to zoom`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className={cn(
          'group relative mx-auto w-full touch-none select-none overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          variant === 'desktop' ? 'aspect-[16/9]' : 'aspect-[9/16] max-w-[200px]',
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={variant === 'desktop' ? '600px' : '200px'}
          draggable={false}
          className="pointer-events-none object-cover"
          style={frameStyle(value)}
        />

        {/* Rule-of-thirds guide while dragging */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity',
            dragging ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            backgroundImage:
              'linear-gradient(to right, transparent calc(33.333% - 0.5px), rgb(255 255 255 / 0.6) calc(33.333% - 0.5px), rgb(255 255 255 / 0.6) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px), transparent calc(66.666% - 0.5px), rgb(255 255 255 / 0.6) calc(66.666% - 0.5px), rgb(255 255 255 / 0.6) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px)), linear-gradient(to bottom, transparent calc(33.333% - 0.5px), rgb(255 255 255 / 0.6) calc(33.333% - 0.5px), rgb(255 255 255 / 0.6) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px), transparent calc(66.666% - 0.5px), rgb(255 255 255 / 0.6) calc(66.666% - 0.5px), rgb(255 255 255 / 0.6) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px))',
          }}
        />

        <span
          className={cn(
            'pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white transition-opacity',
            dragging ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'
          )}
        >
          <Move className="h-3 w-3" aria-hidden />
          Drag to reposition
        </span>
      </div>

      <label className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="w-10 shrink-0">Zoom</span>
        <input
          type="range"
          min={1}
          max={HERO_MAX_ZOOM}
          step={0.05}
          value={value.zoom}
          onChange={(e) => set({ zoom: e.target.valueAsNumber })}
          className="h-6 w-full accent-primary"
        />
        <span className="w-10 shrink-0 text-right tabular-nums">{value.zoom.toFixed(1)}×</span>
      </label>
    </div>
  );
}
