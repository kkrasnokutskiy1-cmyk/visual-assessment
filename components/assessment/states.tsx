import type { ReactNode } from "react";

export function LoadingState({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-4 px-6 py-12" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="h-5 w-64 animate-pulse rounded-md bg-tint" />
      <div className="h-4 w-96 animate-pulse rounded-md bg-tint" />
      <div className="mt-4 aspect-[16/9] w-full max-w-[960px] animate-pulse rounded-lg bg-tint" />
    </div>
  );
}

export function ErrorState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[var(--reading-max)] flex-col items-start gap-3 px-6 py-16">
      <h1 className="text-title font-medium">{title}</h1>
      <p className="text-body text-muted-foreground">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
