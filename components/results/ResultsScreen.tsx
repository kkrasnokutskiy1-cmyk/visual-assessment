"use client";

// Loads an attempt (owner or share link), resolves its assessment version and
// renders the read-only results. Owner: D.

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Attempt, PublicAssessment } from "@/lib/assessment/types";
import { buildExport } from "@/lib/export/build";
import { downloadExport } from "@/lib/export/download";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ApiError, resultsApi } from "./api";
import { ResultsSummary, ResultsView } from "./ResultsView";
import { SharePanel } from "./SharePanel";

type Mode = "owner" | "share";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string; status: number }
  | { kind: "ready"; attempt: Attempt };

function errorText(mode: Mode, status: number, message: string): string {
  if (mode === "share" && (status === 404 || status === 403)) {
    return "Ссылка недействительна или отключена владельцем.";
  }
  if (status === 401) return "Войдите в аккаунт, чтобы увидеть свои результаты.";
  if (status === 403 || status === 404) return "Проход не найден или принадлежит другому аккаунту.";
  return message;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" });
}

export function ResultsScreen({
  mode,
  params,
  bank,
}: {
  mode: Mode;
  params: Promise<{ attemptId?: string; token?: string }>;
  /** Every published version, without interpretation (lib/assessment/public.ts). */
  bank: PublicAssessment[];
}) {
  const { attemptId, token } = use(params);
  const key = (mode === "owner" ? attemptId : token) ?? "";
  const [state, setState] = useState<State>({ kind: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = mode === "owner" ? resultsApi.attempt(key) : resultsApi.shared(key);
    load.then(
      (attempt) => !cancelled && setState({ kind: "ready", attempt }),
      (e: unknown) => {
        if (cancelled) return;
        const status = e instanceof ApiError ? e.status : 500;
        const message = e instanceof Error ? e.message : "Не удалось загрузить результаты";
        setState({ kind: "error", status, message: errorText(mode, status, message) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [mode, key, reload]);

  const attempt = state.kind === "ready" ? state.attempt : null;
  const assessment = useMemo(
    () => {
      if (!attempt) return undefined;
      // Prefer the server-side snapshot taken at the start of the attempt, so a
      // later bank change never alters a finished attempt (interpretation is
      // stripped by the server; the export never reads it).
      const snapshot = (attempt as Attempt & { assessmentSnapshot?: PublicAssessment })
        .assessmentSnapshot;
      if (snapshot?.blocks) return snapshot;
      return bank.find(
        (a) => a.id === attempt.assessmentId && a.version === attempt.assessmentVersion,
      );
    },
    [attempt, bank],
  );
  const data = useMemo(
    () => (attempt && assessment ? buildExport(attempt, assessment) : null),
    [attempt, assessment],
  );

  if (state.kind === "loading") {
    return <ResultsSkeleton />;
  }

  if (state.kind === "error") {
    return (
      <div className="grid max-w-prose gap-4 py-24" role="alert">
        <h1 className="text-xl font-medium">Результаты недоступны</h1>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <div className="flex gap-2">
          {state.status === 401 ? (
            <Button asChild variant="primary">
              <Link href={`/login?next=/results/${encodeURIComponent(key)}`}>Войти</Link>
            </Button>
          ) : state.status === 0 || state.status >= 500 ? (
            <Button
              variant="secondary"
              onClick={() => {
                setState({ kind: "loading" });
                setReload((n) => n + 1);
              }}
            >
              Повторить
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!assessment || !data) {
    return (
      <div className="grid max-w-prose gap-2 py-24" role="alert">
        <h1 className="text-xl font-medium">Версия асессмента не найдена</h1>
        <p className="text-sm text-muted-foreground">
          Проход создан для «{state.attempt.assessmentId}» v{state.attempt.assessmentVersion}, но
          этой версии банка вопросов нет в приложении.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 py-12">
      <header className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          {mode === "share" ? "Результаты по ссылке" : "Мои результаты"} ·{" "}
          {state.attempt.status === "completed" ? "проход завершён" : "проход не завершён"}
        </p>
        <h1 className="text-2xl font-medium text-balance">{assessment.title}</h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          Версия {assessment.version} · начат {formatDate(state.attempt.startedAt)}
          {state.attempt.completedAt ? ` · завершён ${formatDate(state.attempt.completedAt)}` : ""}
        </p>
      </header>

      <ResultsSummary data={data} />

      {mode === "owner" ? (
        <nav className="flex gap-2" aria-label="Действия с проходом">
          {state.attempt.status === "completed" ? (
            <Button asChild variant="secondary">
              <Link href="/assessment">К обзору и новой попытке</Link>
            </Button>
          ) : (
            <Button asChild variant="primary">
              <Link href={`/assessment/${encodeURIComponent(state.attempt.id)}`}>
                Продолжить проход
              </Link>
            </Button>
          )}
        </nav>
      ) : null}

      {mode === "owner" ? (
        <SharePanel attempt={state.attempt} assessment={assessment} />
      ) : (
        <div>
          <Button
            variant="secondary"
            leadingIcon={Download}
            onClick={() =>
              downloadExport(
                buildExport(state.attempt, assessment, { baseUrl: window.location.origin }),
              )
            }
          >
            Скачать JSON
          </Button>
        </div>
      )}

      <ResultsView data={data} />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="grid gap-6 py-12" aria-busy="true" aria-label="Загрузка результатов">
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="h-8 w-96 rounded bg-muted" />
      <div className="h-20 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}
