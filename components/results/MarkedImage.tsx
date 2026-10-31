// Read-only image with the respondent's marks. Marks are normalised (0..1),
// so they stay attached to the image at any rendered size.
// Owner: D.

import type { Asset, Mark } from "@/lib/assessment/types";

export function MarkedImage({ asset, marks = [] }: { asset: Asset; marks?: Mark[] }) {
  return (
    <figure className="relative w-full overflow-hidden rounded-lg border bg-white">
      {/* Examples keep their own colours regardless of the platform theme. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        loading="lazy"
        className="block h-auto w-full"
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      />
      {marks.map((mark, i) => (
        <span
          key={i}
          aria-label={`Отметка ${i + 1}`}
          className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-foreground text-xs font-medium text-background shadow-sm"
          style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%` }}
        >
          {i + 1}
        </span>
      ))}
    </figure>
  );
}
