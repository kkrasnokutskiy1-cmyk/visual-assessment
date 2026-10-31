"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SyncStatus } from "./use-answer-sync";

export function SaveIndicator({ status, onRetry }: { status: SyncStatus; onRetry: () => void }) {
  if (status.state === "idle") return <span className="text-caption text-muted-foreground">Изменения сохраняются автоматически</span>;
  if (status.state === "saving")
    return (
      <span role="status" className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Сохранение…
      </span>
    );
  if (status.state === "saved")
    return (
      <span role="status" className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Check className="h-3.5 w-3.5" aria-hidden />
        Сохранено
      </span>
    );
  return (
    <span role="alert" className="flex items-center gap-2 text-caption text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="max-w-[420px]">
        Не удалось сохранить{status.pending ? ` (${status.pending})` : ""}. {status.error}
      </span>
      <Button type="button" variant="ghost" size="compact" onClick={onRetry}>
        Повторить
      </Button>
    </span>
  );
}
