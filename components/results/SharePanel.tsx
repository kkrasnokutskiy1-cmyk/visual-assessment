"use client";

// Ways to hand results over for independent analysis: JSON file (always works)
// and an explicit share link that the owner can revoke.
// Owner: D. Used on the completion screen (A) and on /results/[attemptId].

import { useState } from "react";
import { Check, Copy, Download, Link2, Link2Off } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Assessment, Attempt } from "@/lib/assessment/types";
import { buildExport } from "@/lib/export/build";
import { downloadExport } from "@/lib/export/download";
import { resultsApi, shareUrl } from "./api";

type Busy = "create" | "revoke" | null;

export function SharePanel({
  attempt,
  assessment,
  onShareChange,
}: {
  attempt: Attempt;
  assessment: Assessment;
  onShareChange?: (token: string | null) => void;
}) {
  const [token, setToken] = useState<string | null>(attempt.shareToken ?? null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = token ? shareUrl(token) : null;

  function handleDownload() {
    downloadExport(buildExport(attempt, assessment, { baseUrl: window.location.origin }));
  }

  async function handleCreate() {
    setBusy("create");
    setError(null);
    try {
      const next = await resultsApi.createShare(attempt.id);
      setToken(next);
      onShareChange?.(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать ссылку");
    } finally {
      setBusy(null);
    }
  }

  async function handleRevoke() {
    setBusy("revoke");
    setError(null);
    try {
      await resultsApi.revokeShare(attempt.id);
      setToken(null);
      setCopied(false);
      onShareChange?.(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отключить ссылку");
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Браузер не дал доступ к буферу обмена — скопируйте ссылку вручную");
    }
  }

  return (
    <section aria-labelledby="share-title" className="grid gap-6 rounded-lg border p-6">
      <div>
        <h2 id="share-title" className="text-base font-medium">
          Передать результаты
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Оценка и разбор здесь не показываются. Файл — надёжный способ: его можно загрузить в чат
          для анализа. Ссылка открывает ответы без входа, пока вы её не отключите.
        </p>
        {attempt.status !== "completed" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Проход ещё не завершён — в файл и по ссылке попадут текущие ответы.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium">Файл JSON</p>
            <p className="text-sm text-muted-foreground">
              Вопросы, ответы, пропуски, отметки, комментарии, источники и версии.
            </p>
          </div>
          <Button variant="secondary" leadingIcon={Download} onClick={handleDownload}>
            Скачать
          </Button>
        </div>

        <div className="flex items-center justify-between gap-6 border-t pt-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Ссылка на результаты</p>
            {url ? (
              <p className="truncate font-mono text-sm text-muted-foreground" title={url}>
                {url}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Не создана — результаты видны только после входа.
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {url ? (
              <>
                <Button
                  variant="secondary"
                  leadingIcon={copied ? Check : Copy}
                  onClick={handleCopy}
                  aria-live="polite"
                >
                  {copied ? "Скопировано" : "Копировать"}
                </Button>
                <Button
                  variant="ghost"
                  leadingIcon={Link2Off}
                  onClick={handleRevoke}
                  disabled={busy !== null}
                  loading={busy === "revoke"}
                >
                  Отключить
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                leadingIcon={Link2}
                onClick={handleCreate}
                disabled={busy !== null}
                loading={busy === "create"}
              >
                Создать ссылку
              </Button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
