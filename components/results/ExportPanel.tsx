"use client";

// Hands results over for independent analysis as a JSON file.
// Owner: D. Used on /results/[attemptId].

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Attempt, PublicAssessment } from "@/lib/assessment/types";
import { buildExport } from "@/lib/export/build";
import { downloadExport } from "@/lib/export/download";

export function ExportPanel({
  attempt,
  assessment,
}: {
  attempt: Attempt;
  assessment: PublicAssessment;
}) {
  function handleDownload() {
    downloadExport(buildExport(attempt, assessment, { baseUrl: window.location.origin }));
  }

  return (
    <section aria-labelledby="export-title" className="grid gap-6 rounded-lg border p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 id="export-title" className="text-base font-medium">
            Файл JSON
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Вопросы, ответы, пропуски, отметки, комментарии, источники и версии. Оценка и разбор
            здесь не показываются — файл можно загрузить в чат для анализа. Ответы хранятся только
            в этом браузере, поэтому файл — ещё и резервная копия.
          </p>
          {attempt.status !== "completed" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Проход ещё не завершён — в файл попадут текущие ответы.
            </p>
          ) : null}
        </div>
        <Button variant="secondary" leadingIcon={Download} onClick={handleDownload}>
          Скачать
        </Button>
      </div>
    </section>
  );
}
