import type { Asset, Reference } from "@/lib/assessment/types";

const url = "https://design.google/library/google-sans-flex-font";
const image = (file: string, alt: string, width: number, height: number): Asset => ({
  src: `/references/typography/${file}`, alt, width, height,
  credit: "Google Design; иллюстрация Arthur Ribeiro Vergani", originUrl: url,
  license: "Цитирование в учебных целях; права на воспроизведение не подтверждены",
});
export const typographyFigures = {
  comparison: image("google-sans-comparison.webp", "Сравнение форм Product Sans и Google Sans в слове Beautiful", 1920, 960),
  code: image("google-sans-code.webp", "Сравнение строчных a и g в Google Sans Mono и Google Sans Code", 2000, 2000),
};
const base = { title: "Making Google Sans Flex", author: "Команда Google Design", publisher: "Google Design", url, publishedAt: "2025", topic: "typography" };
export const googleSans: Reference = {
  ...base, id: "type-google-sans",
  problem: "Product Sans создавался для логотипных сочетаний; команда столкнулась с ограничениями при использовании в интерфейсе и мелком тексте.",
  change: "Google Sans и затем Google Sans Text адаптировали формы и интервалы для новых условий применения.",
  figures: { single: typographyFigures.comparison },
};
export const googleCode: Reference = {
  ...base, id: "type-google-code",
  problem: "Google Sans Mono применили для кода, хотя шрифт не разрабатывался для мелкого набора; сходные знаки было трудно различать.",
  change: "Google Sans Code проектировали с учётом кода и различимости букв, цифр и операторов.",
  figures: { single: typographyFigures.code },
};
export const typographyReferences: Reference[] = [googleSans, googleCode];
