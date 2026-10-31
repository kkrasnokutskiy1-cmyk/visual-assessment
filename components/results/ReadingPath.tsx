import type { ReadingModule } from "@/content/course/reading-path";

export function ReadingPath({ modules }: { modules: ReadingModule[] }) {
  if (modules.length === 0) return null;
  return (
    <section aria-labelledby="reading-title" className="grid gap-5 border-t pt-8">
      <div className="grid max-w-prose gap-2">
        <h2 id="reading-title" className="text-xl font-medium">Материалы для дальнейшего изучения</h2>
        <p className="text-sm text-muted-foreground">
          Первоисточники заданий сгруппированы по темам. Сначала показаны темы, где вы выбрали
          «не уверен» или пропустили вопрос. Это порядок чтения, а не оценка ваших навыков;
          индивидуальная программа требует отдельного разбора ответов.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <article key={module.id} className="rounded-lg border p-5">
            <h3 className="font-medium">{module.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
            {module.needsReview > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">Неуверенных ответов и пропусков: {module.needsReview}</p>
            )}
            <ul className="mt-4 grid gap-2 text-sm">
              {module.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-muted-foreground">
                    {source.title}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">{source.author} · {source.publisher}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
