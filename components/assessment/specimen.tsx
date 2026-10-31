"use client";

import { Maximize2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Asset } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

/**
 * Theme-independent frame for a visual example. Keeps the intrinsic aspect ratio
 * and offers a zoom view at up to native size.
 */
export function Specimen({
  asset,
  className,
  overlay,
  zoomable = true,
  label,
}: {
  asset: Asset;
  className?: string;
  /** Rendered over the image in the same coordinate box (marks). */
  overlay?: ReactNode;
  zoomable?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <figure className={cn("group/specimen relative", className)}>
      <div
        className="relative overflow-hidden rounded-lg border border-specimen-border bg-specimen"
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG specimens must render untouched */}
        <img
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
        />
        {overlay}
      </div>
      {(asset.caption || asset.credit) && (
        <figcaption className="mt-1.5 flex flex-wrap gap-x-2 text-caption text-muted-foreground">
          {asset.caption && <span className="text-foreground">{asset.caption}</span>}
          {asset.credit &&
            (asset.originUrl ? (
              <a href={asset.originUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {asset.credit}
              </a>
            ) : (
              <span>{asset.credit}</span>
            ))}
        </figcaption>
      )}
      {zoomable && (
        <div className="absolute right-2 top-2">
          <Button
            type="button"
            variant="secondary"
            size="icon-compact"
            aria-label={label ? `Увеличить: ${label}` : "Увеличить"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Maximize2 />
          </Button>
        </div>
      )}
      {zoomable && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent size="xl" className="max-w-[min(96vw,1400px)]">
            <DialogTitle className="mb-3">{label ?? asset.alt}</DialogTitle>
            <div className="max-h-[80vh] overflow-auto rounded-lg border border-specimen-border bg-specimen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.src}
                alt={asset.alt}
                width={asset.width}
                height={asset.height}
                className="mx-auto block h-auto max-w-none"
                style={{ width: asset.width, maxWidth: "none" }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </figure>
  );
}
