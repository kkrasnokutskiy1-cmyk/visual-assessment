// Research base for the "hierarchy" block: signifiers, emphasis of key actions,
// and redesign trade-offs. Every entry paraphrases a published source; images are
// local copies of the source's own figures (nothing redrawn). Owner: A.
import type { Asset, Reference } from "@/lib/assessment/types";

const LICENSE = "Цитирование в учебных целях; права на изображение не подтверждены";

const NNG_URL = "https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/";
const M3_URL = "https://design.google/library/expressive-material-design-google-research";
const FIGMA_URL = "https://www.figma.com/blog/behind-our-redesign-ui3/";

const img = (
  file: string,
  alt: string,
  width: number,
  height: number,
  credit: string,
  originUrl: string,
  caption?: string,
): Asset => ({ src: `/references/hierarchy/${file}`, alt, width, height, credit, originUrl, license: LICENSE, caption });

const nng = (file: string, alt: string, w: number, h: number) =>
  img(file, alt, w, h, "Nielsen Norman Group, исследование Kate Moran (2017)", NNG_URL, "Слева — сильные сигнификаторы, справа — слабые (стимулы исследования)");
const m3 = (file: string, alt: string) => img(file, alt, 900, 1125, "Google Design, исследование Material 3 Expressive", M3_URL);
const figma = (file: string, alt: string, caption?: string) => img(file, alt, 1000, 666, "Figma Blog, Ryhan Hassan, Joel Miller, KC Oh (2024)", FIGMA_URL, caption);

const nngBase = {
  title: "Flat UI Elements Attract Less Attention and Cause Uncertainty",
  author: "Kate Moran",
  publisher: "Nielsen Norman Group",
  url: NNG_URL,
  publishedAt: "2017-09-03",
  topic: "hierarchy",
} as const;

const m3Base = {
  title: "Better, Easier, Emotional UX: The research behind Material 3 Expressive",
  author: "Команда исследований Material Design",
  publisher: "Google Design",
  url: M3_URL,
  topic: "hierarchy",
} as const;

const figmaBase = {
  title: "Inside the redesigned Figma, where your work takes center stage",
  author: "Ryhan Hassan, Joel Miller, KC Oh",
  publisher: "Figma Blog",
  url: FIGMA_URL,
  publishedAt: "2024-06-26",
  topic: "hierarchy",
} as const;

export const references: Reference[] = [
  {
    ...nngBase,
    id: "nng-flat-signifiers-overall",
    problem:
      "В «плоских» версиях страниц у интерактивных элементов слабые или отсутствующие сигнификаторы (ghost-кнопки, ссылки, оформленные как обычный текст). Пользователь видит элемент, но не уверен, что это цель, и продолжает искать.",
    change:
      "9 реальных страниц, по две почти одинаковые версии каждой: различаются только силой сигнификаторов. 71 участник, айтрекинг, межгрупповой дизайн.",
    quote:
      "On average participants spent 22% more time (i.e., slower task performance) looking at the pages with weak signifiers.",
    result:
      "На версиях со слабыми сигнификаторами на 22% больше времени и на 25% больше фиксаций (p < 0,05). Ошибочные клики авторы не измеряли и прямо об этом пишут.",
    figures: { single: nng("nng-cosmopolitan-strong-weak.jpg", "Две версии страницы номера отеля The Cosmopolitan: слева объёмные кнопки, справа плоские ghost-кнопки", 1400, 512) },
  },
  {
    ...nngBase,
    id: "nng-flat-signifiers-link",
    problem:
      "В слабой версии ссылка Shop Pearl оформлена как обычный текст. Взгляд не спускается от подзаголовка к ссылке: подзаголовок выглядит кликабельной целью.",
    change: "Сильная версия: ссылка цветом и подчёркиванием. Слабая: ссылка неотличима от статичного текста.",
    result:
      "9 из 24 участников со слабой версией остановились на подзаголовке и не посмотрели на ссылку. Паттерн «подзаголовок → ссылка»: 86% (25 из 29) на сильной версии против 50% (12 из 24) на слабой, p < 0,005.",
    figures: { single: nng("nng-brilliant-earth-strong-weak.png", "Фрагмент страницы Brilliant Earth: слева ссылка SHOP PEARL цветом и подчёркиванием, справа Shop Pearl как обычный текст", 1240, 285) },
  },
  {
    ...nngBase,
    id: "nng-flat-signifiers-when-works",
    problem:
      "На трёх парах из девяти разницы в тепловых картах почти не было. Авторы разбирают, при каких условиях плоский стиль не мешает.",
    change: "В паре Ally Bank ссылки в тексте были синими и подчёркнутыми против светло-фиолетовых без подчёркивания.",
    quote:
      "As long as in-line text links are presented in a contrasting color, users will recognize their purpose, even without an underline.",
    result:
      "Плоский стиль работает, если одновременно соблюдены три условия: низкая плотность информации, привычная раскладка и заметные контрастные цели с запасом пространства вокруг. Нужны все три, а не одно-два.",
    figures: { single: nng("nng-ally-strong-weak.jpg", "Две версии страницы Ally Bank: слева синие подчёркнутые ссылки, справа фиолетовые ссылки без подчёркивания", 1400, 791) },
  },
  {
    ...nngBase,
    id: "nng-flat-signifiers-tabs",
    problem:
      "В слабой версии Hertz вкладка View/Modify/Cancel a Reservation не читается как вкладка. Помимо цели, участники рассматривают футер, промо и поля формы.",
    quote:
      "The increased focus on the weak page’s footer is especially troubling, because it’s a signal that the users were getting desperate.",
    result: "Фиксации на слабой версии распределены шире; на сильной сосредоточены вокруг целевой вкладки.",
    figures: { single: nng("nng-hertz-strong-weak.jpg", "Две версии формы бронирования Hertz: слева объёмные вкладки и кнопки, справа плоские", 1400, 741) },
  },
  {
    ...m3Base,
    id: "m3-expressive-send",
    problem:
      "В стандартной версии почтового клиента маленькая кнопка Send стоит в верхнем тулбаре рядом с другими действиями (вложить файл и т. п.) и не выделяется.",
    change: "Кнопка Send увеличена, перенесена прямо над клавиатурой и окрашена во вторичный цвет.",
    result:
      "На задании «отправьте письмо» взгляд находил кнопку в 4 раза быстрее. На 10 приложениях ключевые элементы находили до 4 раз быстрее. Возрастной эффект почти исчез: участники 45+ находили элементы так же быстро, как молодые.",
    figures: {
      before: m3("m3-email-standard.jpg", "Почтовый клиент в стандартном Material 3: кнопка отправки в верхнем тулбаре"),
      after: m3("m3-email-expressive.jpg", "Почтовый клиент в M3 Expressive: крупная кнопка отправки над клавиатурой"),
    },
  },
  {
    ...m3Base,
    id: "m3-expressive-playlist",
    problem:
      "В концепте плейлиста привычный вертикальный список треков заменили хаотично разбросанными обложками без подписей. Участники называли интерфейс современным, но не узнавали в нём плейлист.",
    quote: "No amount of expressive design will beat basic functionality.",
    result:
      "Оценки юзабилити у концепта упали. Отдельно: удаление текстовых подписей у действий в почте тоже ухудшило юзабилити.",
    figures: {
      before: m3("m3-playlist-concept.jpg", "Концепт плейлиста: разбросанные обложки разной формы без подписей"),
      after: m3("m3-playlist-familiar.jpg", "Плейлист с привычной каруселью и вертикальным списком треков"),
    },
  },
  {
    ...figmaBase,
    id: "figma-ui3-autolayout-grid",
    problem:
      "В одной из итераций UI3 сетку выравнивания Auto Layout свернули в выпадающий контрол, чтобы упростить панель и сделать её доступнее новичкам. Сетка стала «перемещаться», и опытные пользователи теряли мышечную память.",
    change: "Вернули исходное расположение сетки, но обновили визуальный стиль: фоны у полей, скругления, рамки у выпадающих списков.",
    quote: "The grid moved around too much, so we reverted to the original design to preserve muscle memory for power users",
    figures: {
      before: figma("figma-autolayout-before.jpg", "Панель Auto Layout в UI2", "Прежняя панель Auto Layout"),
      single: figma("figma-autolayout-condensed.jpg", "Итерация UI3: сетка выравнивания свёрнута в выпадающий контрол «L, Top»", "Отклонённая итерация: сетка в выпадающем контроле"),
      after: figma("figma-autolayout-final.jpg", "Финальная панель Auto Layout в UI3", "Финальная панель UI3"),
    },
  },
  {
    ...figmaBase,
    id: "figma-ui3-layout-order",
    problem:
      "Команда предполагала, что ширина и высота важнее координат X/Y, и поставила их выше. Тесты показали, что такая инверсия слишком сильно ломает мышечную память.",
    change:
      "Ширину, высоту и Auto Layout объединили в одну секцию, как это устроено в коде, но оставили ниже X/Y. Компонентные свойства (варианты, инстансы) подняли над цветом и размером.",
    figures: { single: figma("figma-properties-panel.jpg", "Панель свойств Figma UI3 для двух фреймов: слева без Auto Layout (секция Layout с W/H), справа с Auto Layout (W/H внутри секции). В обоих случаях секция идёт ниже Position с X/Y") },
  },
];
