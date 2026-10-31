"use client";

import type { Mark } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Click-to-mark overlay. Coordinates are normalised to the image box (0..1),
 * so marks survive any rendering size.
 */
export function MarkLayer({
  marks,
  max,
  disabled,
  onChange,
}: {
  marks: Mark[];
  max: number;
  disabled?: boolean;
  onChange: (marks: Mark[]) => void;
}) {
  const full = marks.length >= max;
  return (
    <div
      role="presentation"
      className={cn("absolute inset-0", !disabled && !full && "cursor-crosshair")}
      onClick={(e) => {
        if (disabled || full) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = clamp((e.clientX - r.left) / r.width);
        const y = clamp((e.clientY - r.top) / r.height);
        onChange([...marks, { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 }]);
      }}
    >
      {marks.map((m, i) => (
        <button
          key={`${m.x}-${m.y}-${i}`}
          type="button"
          disabled={disabled}
          aria-label={`Убрать отметку ${i + 1}`}
          title="Убрать отметку"
          onClick={(e) => {
            e.stopPropagation();
            onChange(marks.filter((_, j) => j !== i));
          }}
          className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-mark text-[11px] font-semibold text-mark-foreground shadow-[0_0_0_2px_#fff] transition-transform duration-[var(--duration-fast)] hover:scale-110 disabled:cursor-default"
          style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
