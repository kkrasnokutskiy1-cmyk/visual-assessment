import type { Asset, Reference } from "@/lib/assessment/types";

// Published product decisions, not measured usability outcomes. Images are
// excerpts of the cited Linear posts; reuse rights have not been confirmed.
const RIGHTS = "Цитирование в учебных целях; права на воспроизведение не подтверждены";
const refreshUrl = "https://linear.app/now/behind-the-latest-design-refresh";
const redesignUrl = "https://linear.app/now/how-we-redesigned-the-linear-ui";
const mobileUrl = "https://linear.app/changelog/2025-10-16-mobile-app-redesign";
const mobileNavigationUrl = "https://linear.app/changelog/2026-01-22-customize-your-navigation-in-linear-mobile";

const image = (file: string, alt: string, width: number, height: number, originUrl: string): Asset => ({
  src: `/references/interaction/${file}`,
  alt,
  width,
  height,
  credit: "Linear — иллюстрация из публикации команды",
  originUrl,
  license: RIGHTS,
});

export const interactionFigures = {
  platforms: image("linear-2024-platforms.png", "Навигационная оболочка Linear в браузере, Windows и macOS", 2352, 2352, redesignUrl),
  sidebar: image("linear-2026-sidebar.jpg", "Боковая навигация Linear до и после обновления 2026 года", 3904, 2720, refreshUrl),
  tabs: image("linear-2026-tabs.jpg", "Вкладки Linear до и после обновления 2026 года", 3904, 2160, refreshUrl),
  header: image("linear-2026-header.jpg", "Схема уровней заголовка Linear: положение, вид и содержание", 3904, 2160, refreshUrl),
  borders: image("linear-2026-borders.jpg", "Разделители интерфейса Linear до и после обновления 2026 года", 3904, 2720, refreshUrl),
  mobile: image("linear-2025-mobile.jpg", "Нижняя навигация мобильного приложения Linear в обновлении 2025 года", 3600, 2026, mobileUrl),
  mobilePinned: image("linear-2026-mobile-pinned.jpg", "Экран настройки закреплённых разделов Linear Mobile", 3600, 2360, mobileNavigationUrl),
};

export const interactionReferences: Reference[] = [
  {
    id: "interaction-linear-platforms",
    title: "How we redesigned the Linear UI (part II)",
    author: "Karri Saarinen, Yann-Edern Gillet и команда Linear",
    publisher: "Linear",
    url: redesignUrl,
    publishedAt: "2024-03-28",
    topic: "interaction",
    problem: "Навигационная оболочка работала в Electron на macOS и Windows, а также в браузере; системные кнопки истории и вкладки нельзя считать частью общего веб-интерфейса.",
    change: "Команда проверила конфигурации от компактных до просторных и предусмотрела отключение системных элементов навигации в браузере.",
    figures: { single: interactionFigures.platforms },
  },
  {
    id: "interaction-linear-sidebar",
    title: "A calmer interface for a product in motion",
    author: "Charlie Aufmann, Maxime Heckel",
    publisher: "Linear",
    url: refreshUrl,
    publishedAt: "2026-03-12",
    topic: "interaction",
    problem: "Боковая панель сохраняла сильный визуальный вес даже после перехода к рабочему содержимому.",
    change: "Команда ослабила неактивные элементы и уточнила иконки, сохранив ориентацию в структуре.",
    figures: { single: interactionFigures.sidebar },
  },
  {
    id: "interaction-linear-tabs",
    title: "A calmer interface for a product in motion",
    author: "Charlie Aufmann, Maxime Heckel",
    publisher: "Linear",
    url: refreshUrl,
    publishedAt: "2026-03-12",
    topic: "interaction",
    problem: "Широкие вкладки и непостоянное расположение элементов заголовка создавали лишний визуальный вес и затрудняли ориентацию.",
    change: "Вкладки сделали компактнее, а структуру заголовков и управляющих элементов согласовали между рабочими областями.",
    figures: { single: interactionFigures.tabs },
  },
  {
    id: "interaction-linear-header",
    title: "A calmer interface for a product in motion",
    author: "Charlie Aufmann, Maxime Heckel",
    publisher: "Linear",
    url: refreshUrl,
    publishedAt: "2026-03-12",
    topic: "interaction",
    problem: "В разных разделах действия заголовка, включая ссылку и совместное использование, перестали находиться в предсказуемых местах.",
    change: "Команда согласовала уровни заголовка и размещение управляющих элементов между видами рабочих объектов.",
    figures: { single: interactionFigures.header },
  },
  {
    id: "interaction-linear-structure",
    title: "A calmer interface for a product in motion",
    author: "Charlie Aufmann, Maxime Heckel",
    publisher: "Linear",
    url: refreshUrl,
    publishedAt: "2026-03-12",
    topic: "interaction",
    problem: "Границы и разделители накапливались без явной причины, хотя должны были помогать ориентироваться.",
    change: "Команда смягчила контраст и уменьшила число разделителей, сохранив связи между частями экрана.",
    figures: { single: interactionFigures.borders },
  },
  {
    id: "interaction-linear-mobile",
    title: "Mobile app redesign",
    author: "Команда Linear",
    publisher: "Linear",
    url: mobileUrl,
    publishedAt: "2025-10-16",
    topic: "interaction",
    problem: "Основные мобильные сценарии требовали быстрого доступа; действие создания задачи должно быть доступно из разных разделов.",
    change: "Навигацию перестроили с нижней панелью для основных сценариев, а Create Issue поместили в верхнюю часть каждого экрана.",
    figures: { single: interactionFigures.mobile },
  },
  {
    id: "interaction-linear-mobile-customize",
    title: "Customize your navigation in Linear Mobile",
    author: "Команда Linear",
    publisher: "Linear",
    url: mobileNavigationUrl,
    publishedAt: "2026-01-22",
    topic: "interaction",
    problem: "Единая нижняя навигация не отражала разные рабочие задачи пользователей и команд.",
    change: "Пользователи могут переставлять основные пункты и закреплять проекты, инициативы и документы для быстрого доступа.",
    figures: { single: interactionFigures.mobilePinned },
  },
];
