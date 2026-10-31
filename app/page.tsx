import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  ["Пройти", "Несколько сеансов по 30–60 минут: выбор между вариантами, отметки на изображениях, короткие комментарии."],
  ["Сохранить", "Каждый ответ автоматически сохраняется в этом браузере — без регистрации и входа."],
  ["Передать", "Экспорт в файл — для независимого анализа без ручного сбора скриншотов."],
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-16 px-6 py-20">
      <section className="flex max-w-[var(--reading-max)] flex-col gap-4">
        <h1 className="text-display font-semibold tracking-tight">Глубокий визуальный асессмент</h1>
        <p className="text-subtitle text-muted-foreground">
          Типографика, композиция, цвет, детали, плотные интерфейсы и компромиссы. Результаты станут основой
          персонального курса и атласа.
        </p>
        <div className="mt-2 flex gap-2">
          <Button asChild>
            <Link href="/assessment">Перейти к асессменту</Link>
          </Button>
        </div>
      </section>
      <ol className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex flex-col gap-2 bg-background p-6">
            <span className="text-caption tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-subtitle font-medium">{title}</p>
            <p className="text-body text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
