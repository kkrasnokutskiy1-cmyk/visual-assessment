import type { Asset, Reference } from "@/lib/assessment/types";

/**
 * Research corpus: colour, surfaces, dark themes, contrast, icon weight.
 * Owner: D. Every entry is a published case with a reachable URL and named authors.
 * `problem` / `change` / `result` paraphrase the source; `quote` is verbatim from it.
 * Images in /public/references/materials are the source's own illustrations,
 * only cropped (labels like "Before/After", ✓/✗ removed so they do not give the answer away).
 * Nothing is redrawn or recoloured.
 */

const RIGHTS = "Цитирование в учебных целях; права на воспроизведение не подтверждены";

type Origin = { credit: string; originUrl: string };

const img = (origin: Origin, file: string, alt: string, width: number, height: number, caption?: string): Asset => ({
  src: `/references/materials/${file}`,
  alt,
  width,
  height,
  credit: origin.credit,
  originUrl: origin.originUrl,
  license: RIGHTS,
  ...(caption ? { caption } : {}),
});

/* ---------- Superhuman: How to design delightful dark themes ---------- */

const superhuman: Origin = {
  credit: "Superhuman, Teresa Man — кадр из иллюстрации статьи",
  originUrl: "https://blog.superhuman.com/how-to-design-delightful-dark-themes/",
};
const superhumanCitation = {
  title: "How to design delightful dark themes",
  author: "Teresa Man",
  publisher: "Superhuman Blog",
  url: superhuman.originUrl,
  publishedAt: "2019-10-10",
  topic: "materials",
};

export const superhumanFigures = {
  textV1: img(superhuman, "superhuman-text-v1.jpg", "Карточка приглашения в тёмной теме Superhuman, вариант 1", 560, 648),
  textV2: img(superhuman, "superhuman-text-v2.jpg", "Карточка приглашения в тёмной теме Superhuman, вариант 2", 560, 648),
  textFinal: img(superhuman, "superhuman-text-final.jpg", "Карточка приглашения в тёмной теме Superhuman, вариант 3", 560, 648),
  remindLight: img(superhuman, "superhuman-remind-light.jpg", "Экран «Remind me» в светлой теме: белые карточки поверх розовой подложки", 560, 1214, "Светлая тема — исходный экран"),
  remindDirect: img(superhuman, "superhuman-remind-direct.jpg", "Экран «Remind me» в тёмной теме, вариант с розовой подложкой", 560, 1214),
  remindAdjusted: img(superhuman, "superhuman-remind-adjusted.jpg", "Экран «Remind me» в тёмной теме, вариант с тёмной подложкой", 560, 1214),
  accentLight: img(superhuman, "superhuman-accent-light.jpg", "Экран пересылки письма в светлой теме, кнопка Send", 560, 430, "Светлая тема — исходный акцент"),
  accentDirect: img(superhuman, "superhuman-accent-direct.jpg", "Экран пересылки письма в тёмной теме, вариант акцента кнопки Send", 560, 430),
  accentAdjusted: img(superhuman, "superhuman-accent-adjusted.jpg", "Экран пересылки письма в тёмной теме, другой вариант акцента кнопки Send", 560, 430),
  surfaces: img(superhuman, "superhuman-surfaces.jpg", "Палитра поверхностей тёмной темы Superhuman: пять уровней от Overlay Light #383B40 до Overflow #010101", 2000, 1135),
};

export const superhumanHalation: Reference = {
  id: "superhuman-dark-halation",
  ...superhumanCitation,
  problem:
    "Белый текст на чистом чёрном (21:1) формально идеален по WCAG, но в тексто-ёмком приложении вызывает утомление и ореолы (halation) — яркие буквы «растекаются» по тёмному фону.",
  change: "Фон сменили на #27292D, а белый текст выставили с непрозрачностью 90%: контраст снизился до 12:1.",
  quote: "We set our white text to 90% opacity so that the dark background blends through. This balances contrast and brightness so that the app is easy to read in a wide variety of light conditions.",
  figures: { before: superhumanFigures.textV1, after: superhumanFigures.textFinal, single: superhumanFigures.textV2 },
};

export const superhumanOverlay: Reference = {
  id: "superhuman-dark-overlay",
  ...superhumanCitation,
  problem:
    "Крупные плоскости яркого цвета, нормальные для светлой темы (где важный элемент ещё ярче), в тёмной теме перетягивают внимание с главного — розовая подложка затемнения спорит с диалогом.",
  change: "Розовую подложку на экране «Remind me» в тёмной теме убрали совсем: серые карточки на чёрном затемнении.",
  quote: "In our light theme, the pink overlay does not distract from the even brighter dialog. But in our dark theme, the same overlay pulls our attention away.",
  figures: { before: superhumanFigures.remindDirect, after: superhumanFigures.remindAdjusted, single: superhumanFigures.remindLight },
};

export const superhumanAccent: Reference = {
  id: "superhuman-dark-accent",
  ...superhumanCitation,
  problem: "Акцент из светлой темы, перенесённый как есть, рядом с приглушённым текстом тёмной темы выглядит слишком ярким и перетягивает внимание.",
  change: "Тон сохранили, светлоту снизили, насыщенность подняли: #AEB1DD (H236 S41 L77) → #A0A4D9 (H236 S43 L74).",
  quote: "First, we reduce lightness so these colors do not overpower nearby text. Second, we increase saturation so they still have character.",
  figures: { before: superhumanFigures.accentDirect, after: superhumanFigures.accentAdjusted, single: superhumanFigures.accentLight },
};

export const superhumanSurfaces: Reference = {
  id: "superhuman-dark-surfaces",
  ...superhumanCitation,
  problem:
    "Инверсия светлой темы делает дальние слои светлыми, а ближние тёмными. Кроме того, чистый #000000 на OLED даёт «black smearing» при прокрутке и не позволяет показать глубину тенью.",
  change: "Ближние слои светлее, дальние темнее; пять серых. Даже самый дальний слой — #010101, а не чистый чёрный.",
  quote: "In dark themes, background colours for UI elements follow one guiding principle: the closer the layer is to the user (e.g. modals), the lighter the surface area.",
  figures: { single: superhumanFigures.surfaces },
};

/* ---------- Stripe: Designing accessible color systems ---------- */

const stripe: Origin = {
  credit: "Stripe, Daryl Koopersmith и Wilson Miner — иллюстрация из статьи",
  originUrl: "https://stripe.com/blog/accessible-color-systems",
};
const stripeCitation = {
  title: "Designing accessible color systems",
  author: "Daryl Koopersmith, Wilson Miner",
  publisher: "Stripe Blog",
  url: stripe.originUrl,
  publishedAt: "2019-10-15",
  topic: "materials",
};

export const stripeFigures = {
  darkenedStep: img(stripe, "stripe-darkened-step.png", "Названия цветов палитры Stripe с коэффициентом контраста: слева исходные оттенки, справа — каждый затемнён на шаг", 1078, 895),
  badgesOutline: img({ ...stripe, credit: "Stripe — кадр из иллюстрации статьи" }, "stripe-badges-outline.png", "Четыре бейджа Stripe: цветной текст и тонкая обводка на светлом фоне", 1078, 110),
  badgesFilled: img({ ...stripe, credit: "Stripe — кадр из иллюстрации статьи" }, "stripe-badges-filled.png", "Четыре бейджа Stripe: тёмный текст на цветной заливке", 1078, 110),
};

export const stripeMuddy: Reference = {
  id: "stripe-darkened-step",
  ...stripeCitation,
  problem:
    "Затемнение каждого цвета на шаг проходит порог контраста на белом, но палитра теряет яркость: цвета становятся тёмными и грязными, оттенки трудно различить между собой.",
  change: "Палитру перестроили в перцептивно равномерном пространстве CIELAB, выровняв кривую контраста для всех оттенков, а не подбирая каждую ступень вручную.",
  quote: "The colors pass guidelines on a white background, but they’re dark and muddy and it’s difficult to tell the hues apart.",
  result:
    "По словам авторов, цвета текста и иконок по умолчанию проходят порог WCAG 2.0 на белом и на самой светлой подложке каждого оттенка; любые два цвета на расстоянии пяти ступеней гарантируют контраст для мелкого текста, четырёх — для иконок и крупного текста.",
  figures: { single: stripeFigures.darkenedStep },
};

export const stripeBadges: Reference = {
  id: "stripe-badges",
  ...stripeCitation,
  problem: "На самом светлом уровне цвета обводочного бейджа почти не отличаются друг от друга: различие держится на тонком цветном тексте.",
  change: "Бейдж перевели на цветную заливку: фон и текст сдвинули на уровень вверх по новой шкале, сохранив контраст текста для всех цветов.",
  quote: "For example, we redesigned our Badge component to use a color background to clearly differentiate each color.",
  figures: { before: stripeFigures.badgesOutline, after: stripeFigures.badgesFilled },
};

/* ---------- Linear: How we redesigned the Linear UI (part II) ---------- */

const linear: Origin = {
  credit: "Linear — иллюстрация из статьи",
  originUrl: "https://linear.app/now/how-we-redesigned-the-linear-ui",
};
const linearCitation = {
  title: "How we redesigned the Linear UI (part II)",
  author: "Karri Saarinen, Yann-Edern Gillet, Andreas Eldh, Romain Cascino",
  publisher: "Linear",
  url: linear.originUrl,
  publishedAt: "2024-03-28",
  topic: "materials",
};

export const linearFigures = {
  before: img(linear, "linear-before.jpg", "Linear, тёмная тема: инбокс, задача и панель свойств", 1400, 821),
  after: img(linear, "linear-after.jpg", "Linear, тёмная тема: тот же экран инбокса, задачи и свойств", 1400, 821),
  lchHsl: img(linear, "linear-lch-hsl.jpg", "Сетка образцов шести оттенков: для каждого две строки, LCH и HSL, при светлоте 10–90", 1400, 962),
};

export const linearNeutral: Reference = {
  id: "linear-ui-refresh-color",
  ...linearCitation,
  problem:
    "Прежняя тема была менее контрастной и заметно окрашена «хромой» (синим) — интерфейс выглядел менее нейтральным; заголовки и хром перегружены визуальным шумом.",
  change:
    "Ограничили долю хромы (синего) в расчётах цветовой системы; текст и нейтральные иконки сделали темнее в светлой теме и светлее в тёмной; выровняли подписи, иконки и кнопки в сайдбаре и табах.",
  quote:
    "The latter was achieved by limiting how much chrome (blue in our case) was used in the calculations applied to our color system. The contrast of the content has also been improved by making our text and neutral icons darker in light mode and lighter in dark mode.",
  figures: { before: linearFigures.before, after: linearFigures.after },
};

export const linearLch: Reference = {
  id: "linear-lch-themes",
  ...linearCitation,
  problem:
    "В HSL одинаковое значение светлоты у разных оттенков выглядит по-разному светлым, поэтому каждую тему приходилось задавать вручную — 98 переменных на тему.",
  change: "Основные светлую и тёмную темы перевели на генератор в LCH: тема задаётся тремя параметрами — базовый цвет, акцент и контраст.",
  quote:
    "So, instead of having to define 98 specific variables for each theme, we defined three: base color, accent color, and contrast.",
  figures: { single: linearFigures.lchHsl },
};

/* ---------- GitLab: Hey icons, lighten up ---------- */

const gitlab: Origin = {
  credit: "GitLab, Jeremy Elder — кадр из иллюстрации статьи",
  originUrl: "https://about.gitlab.com/blog/hey-icons-lighten-up/",
};

export const gitlabFigures = {
  heavy: img(gitlab, "gitlab-icons-2px.png", "Набор из 15 иконок GitLab в светлом и тёмном интерфейсе, вариант 1", 1088, 250),
  light: img(gitlab, "gitlab-icons-15px.png", "Тот же набор из 15 иконок GitLab в светлом и тёмном интерфейсе, вариант 2", 1088, 250),
};

export const gitlabIcons: Reference = {
  id: "gitlab-icon-stroke",
  title: "Hey icons, lighten up",
  author: "Jeremy Elder",
  publisher: "GitLab Blog",
  url: gitlab.originUrl,
  publishedAt: "2021-12-17",
  topic: "materials",
  problem:
    "В плотном продукте иконки выполняют задачи и показывают состояние, а не служат декором; обводка 2px на сетке 16px делала их тяжелее текста — они конкурировали с ним за внимание, мелкие детали сливались.",
  change: "Обводку сменили с 2px на 1.5px, не меняя сетку 16px и метафоры.",
  quote:
    "GitLab uses system fonts, and the updated icons match the weight of a regular sans-serif font at body size (the most common font in our UI). Icons don’t compete with the text as much, and there’s a better balance of visual weight.",
  figures: { before: gitlabFigures.heavy, after: gitlabFigures.light },
};

/* ---------- Atlassian: Building Atlassian's new icon system ---------- */

const atlassian: Origin = {
  credit: "Atlassian Design System — иллюстрация из статьи",
  originUrl: "https://atlassian.design/whats-new/building-atlassians-new-icon-system",
};
const atlassianCrop: Origin = { ...atlassian, credit: "Atlassian Design System — кадр из иллюстрации статьи" };
const atlassianCitation = {
  title: "Building Atlassian’s new icon system",
  author: "Zac Sanderson-Harris, Jesse Bauer, Andrew Campbell",
  publisher: "Atlassian Design System",
  url: atlassian.originUrl,
  publishedAt: "2025-09-08",
  topic: "materials",
};

export const atlassianFigures = {
  stroke: img(atlassian, "atlassian-stroke-before-after.png", "Кнопка «Open in…» с иконкой: слева старая иконка 2px рядом с текстом, справа новая 1.5px; красные направляющие сравнивают толщину штрихов иконки и букв", 2400, 840),
  rounded: img(atlassianCrop, "atlassian-terminals-rounded.png", "Иконка изображения на сетке: скругления 2px, круглые окончания линий", 756, 636),
  sharp: img(atlassianCrop, "atlassian-terminals-sharp.png", "Иконка изображения на сетке: без скруглений, прямые окончания линий", 756, 636),
  balanced: img(atlassianCrop, "atlassian-terminals-balanced.png", "Иконка изображения на сетке: скругления 2px, прямые окончания линий", 756, 636),
  tags16: img(atlassianCrop, "atlassian-tags-16.png", "Ряд тегов «Tag» с иконками, вариант 1", 1800, 110),
  tags12: img(atlassianCrop, "atlassian-tags-12.png", "Тот же ряд тегов «Tag» с иконками, вариант 2", 1800, 110),
};

export const atlassianStroke: Reference = {
  id: "atlassian-icon-stroke",
  ...atlassianCitation,
  problem:
    "Старые иконки (обводка 2px на холсте 24px) были визуально тяжелее остального UI — дизайнеры компенсировали это, крася иконки рядом с текстом в более светлый серый.",
  change: "Иконки перерисовали с обводкой 1.5px на холсте 16px так, чтобы толщина штриха соответствовала штриху шрифта Atlassian Sans.",
  quote:
    "In our legacy system, icons were drawn with a 2px stroke on a 24px canvas, making them visually heavy compared to the rest of Atlassian’s UI. So much so that designers would use a lighter shade of gray for icons next to text, to reduce the icon’s visual emphasis.",
  figures: { single: atlassianFigures.stroke },
};

export const atlassianTerminals: Reference = {
  id: "atlassian-icon-terminals",
  ...atlassianCitation,
  problem: "Нужно было соединить угловатость бренда с округлыми формами нового шрифта Atlassian Sans; полностью круглые и полностью острые формы рассматривались и были отклонены.",
  change: "Выбран «сбалансированный» вариант: скругления углов 2px, но прямые (не круглые) окончания линий.",
  quote:
    "To adapt, we combined the brand's angular qualities with the rounded features of our new typeface, Atlassian Sans, and applied lighter-weight outlined forms.",
  figures: { single: atlassianFigures.balanced },
};

export const atlassianTags: Reference = {
  id: "atlassian-icon-small-size",
  ...atlassianCitation,
  problem: "Иконки 16px рядом с текстом 12px в тегах выглядят слишком крупными и упираются в края контейнера.",
  change: "Для мелких элементов ввели размер 12px с более тонкой обводкой — он сбалансирован с текстом тега.",
  quote: "12px icons harmoniously balance size and stroke width with accompanying text in smaller tag-like elements.",
  figures: { before: atlassianFigures.tags16, after: atlassianFigures.tags12 },
};

export const materialsReferences: Reference[] = [
  superhumanHalation,
  superhumanOverlay,
  superhumanAccent,
  superhumanSurfaces,
  stripeMuddy,
  stripeBadges,
  linearNeutral,
  linearLch,
  gitlabIcons,
  atlassianStroke,
  atlassianTerminals,
  atlassianTags,
];
