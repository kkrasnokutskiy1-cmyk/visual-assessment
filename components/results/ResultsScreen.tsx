"use client";

// Loads an attempt from this browser's storage, resolves its assessment version
// and renders the read-only results. Owner: D.

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AttemptApiError, attemptsApi } from "@/lib/assessment/client";
import type { Attempt, PublicAssessment } from "@/lib/assessment/types";
import { buildExport } from "@/lib/export/build";
import { Button } from "@/components/ui/button";
import { ExportPanel } from "./ExportPanel";
import { ResultsSummary, ResultsView } from "./ResultsView";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string; status: number }
  | { kind: "ready"; attempt: Attempt };

function errorText(status: number, message: string): string {
  if (status === 404) {
    return "Проход не найден в этом браузере. Результаты хранятся только на устройстве, где вы проходили асессмент.";
  }
  return message;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" });
}

export function ResultsScreen({
  params,
  bank,
}: {
  params: Promise<{ attemptId: string }>;
  /** Every published version, without interpretation (lib/assessment/public.ts). */
  bank: PublicAssessment[];
}) {
  const { attemptId: key } = use(params);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    attemptsApi.get(key).then(
      (attempt) => !cancelled && setState({ kind: "ready", attempt }),
      (e: unknown) => {
        if (cancelled) return;
        const status = e instanceof AttemptApiError ? e.status : 500;
        const message = e instanceof Error ? e.message : "Не удалось загрузить результаты";
        setState({ kind: "error", status, message: errorText(status, message) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, reload]);

  const attempt = state.kind === "ready" ? state.attempt : null;
  const assessment = useMemo(
    () => {
      if (!attempt) return undefined;
      // Prefer a stored snapshot if an attempt carries one (older exports did);
      // otherwise use the bank version the attempt was started on.
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
          {state.status === 404 ? (
            <Button asChild variant="secondary">
              <Link href="/results">Все результаты</Link>
            </Button>
          ) : state.status >= 500 ? (
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
          Мои результаты ·{" "}
          {state.attempt.status === "completed" ? "проход завершён" : "проход не завершён"}
        </p>
        <h1 className="text-2xl font-medium text-balance">{assessment.title}</h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          Версия {assessment.version} · начат {formatDate(state.attempt.startedAt)}
          {state.attempt.completedAt ? ` · завершён ${formatDate(state.attempt.completedAt)}` : ""}
        </p>
      </header>

      <ResultsSummary data={data} />

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

      <ExportPanel attempt={state.attempt} assessment={assessment} />

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
