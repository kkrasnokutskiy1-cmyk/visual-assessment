// v2 block "hierarchy": questions built only on published cases from
// content/research/hierarchy.ts. The answer the source supports is recorded in
// interpretation.observation; distractors are plausible misreadings. Owner: A.
import { references } from "@/content/research/hierarchy";
import type { Asset, Block, Option, Question, Reference } from "@/lib/assessment/types";

const ref = (id: string): Reference => {
  const r = references.find((item) => item.id === id);
  if (!r) throw new Error(`Unknown reference ${id}`);
  return r;
};

const fig = (r: Reference, key: "before" | "after" | "single"): Asset => {
  const a = r.figures[key];
  if (!a) throw new Error(`Reference ${r.id} has no ${key} figure`);
  return a;
};

const opts = (...labels: string[]): Option[] => labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));

type Draft = Omit<Question, "version" | "allowComment" | "source" | "refId" | "interpretation"> & {
  ref: Reference;
  /** Option id the source supports. */
  sourceAnswer: string;
  why: string;
  alternatives?: string[];
};

const q = ({ ref: r, sourceAnswer, why, alternatives = [], ...draft }: Draft): Question => ({
  version: 1,
  allowComment: true,
  refId: r.id,
  source: { title: r.title, url: r.url, author: r.author, publisher: r.publisher, publishedAt: r.publishedAt, license: "Ссылка на первоисточник; пересказ" },
  interpretation: {
    observation: `Ответ по источнику: вариант «${sourceAnswer}». ${why}`,
    explanations: [r.problem, ...(r.result ? [r.result] : [])],
    alternatives,
  },
  ...draft,
});

const overall = ref("nng-flat-signifiers-overall");
const link = ref("nng-flat-signifiers-link");
const whenWorks = ref("nng-flat-signifiers-when-works");
const tabs = ref("nng-flat-signifiers-tabs");
const send = ref("m3-expressive-send");
const playlist = ref("m3-expressive-playlist");
const grid = ref("figma-ui3-autolayout-grid");
const order = ref("figma-ui3-layout-order");

export const block: Block = {
  id: "hierarchy",
  title: "Сигнификаторы и иерархия действий",
  description:
    "Айтрекинг NN/g о плоских интерфейсах, исследование Google по Material 3 Expressive и решения Figma при редизайне UI3: что измеряли, что получилось и где авторы отступили.",
  skills: ["сигнификаторы", "иерархия действий", "привычные паттерны", "мышечная память"],
  questions: [
    q({
      id: "hier-01",
      kind: "choice",
      ref: overall,
      skills: ["сигнификаторы"],
      prompt: "Что NN/g зафиксировали на версиях страниц со слабыми сигнификаторами?",
      context:
        "Одна из девяти пар стимулов: страница номера The Cosmopolitan. Слева объёмные кнопки, фиолетовый цвет только у интерактивных элементов; справа плоские ghost-кнопки. Задача участника: «Забронируйте этот номер». 71 участник, айтрекинг, каждый видел только одну версию.",
      asset: fig(overall, "single"),
      options: opts(
        "На 22% больше ошибочных кликов мимо цели",
        "Больше времени на странице; авторы трактуют это как рост вовлечённости",
        "На 22% больше времени и на 25% больше фиксаций на поиск цели",
        "Статистически значимой разницы нет",
      ),
      sourceAnswer: "c",
      why: "Ошибочные клики авторы не измеряли, а трактовку «больше времени = вовлечённость» прямо отвергают: это неуверенность в клике.",
      alternatives: ["Ответ «нет разницы» частично оправдан: на 3 из 9 пар тепловые карты почти совпали."],
    }),
    q({
      id: "hier-02",
      kind: "choice",
      ref: link,
      skills: ["сигнификаторы", "иерархия"],
      prompt: "В слабой версии (справа) ссылка Shop Pearl выглядит как обычный текст. Что NN/g увидели в движении взгляда?",
      context: "Brilliant Earth, задание «найдите украшения с жемчугом». Различается только оформление ссылки; положение то же.",
      asset: fig(link, "single"),
      options: opts(
        "Ссылку находили быстрее: без подчёркивания меньше визуального шума",
        "Многие останавливались на подзаголовке «3 YEAR: PEARL», принимая его за ссылку, и не доходили до Shop Pearl",
        "Взгляд уходил на фото товара, и участники выбирали его как цель",
        "Разница проявилась только у участников старше 45 лет",
      ),
      sourceAnswer: "b",
      why: "9 из 24 участников остановились на подзаголовке; переход «подзаголовок → ссылка» — 86% на сильной версии против 50% на слабой.",
    }),
    q({
      id: "hier-03",
      kind: "choice",
      ref: whenWorks,
      skills: ["сигнификаторы", "контекст"],
      prompt: "В паре Ally Bank тепловые карты почти не различались. Какой вывод делают авторы?",
      context: "Слева синие подчёркнутые ссылки в тексте, справа светло-фиолетовые без подчёркивания. Это одна из трёх пар без заметной разницы.",
      asset: fig(whenWorks, "single"),
      options: opts(
        "Подчёркивание обязательно всегда; без него ссылки в тексте не узнаются",
        "Плоскому стилю достаточно одного условия: низкой плотности или привычной раскладки",
        "Фиолетовые ссылки читаются лучше синих",
        "Ссылку узнают и без подчёркивания, если цвет заметно контрастирует с текстом; плоский стиль безопасен только при низкой плотности, привычной раскладке и заметных целях одновременно",
      ),
      sourceAnswer: "d",
      why: "Авторы подчёркивают: нужны все три условия, а не одно или два.",
    }),
    q({
      id: "hier-04",
      kind: "choice",
      ref: tabs,
      skills: ["сигнификаторы"],
      prompt: "Куда, по данным NN/g, уходили дополнительные фиксации на плоской версии формы Hertz?",
      context: "Задача: «Отмените бронирование автомобиля». Цель — вкладка View/Modify/Cancel a Reservation. Слева сильная версия, справа слабая.",
      asset: fig(tabs, "single"),
      options: opts(
        "На футер, промо-блоки и поля формы рядом с вкладкой; взгляд на футер авторы считают признаком отчаяния",
        "На логотип и шапку: участники искали главное меню",
        "На кнопки Book as a Member / Guest: их приняли за отмену",
        "Фиксации не отличались от сильной версии",
      ),
      sourceAnswer: "a",
      why: "На сильной версии фиксации сосредоточены у целевой вкладки, на слабой — разбросаны по странице, включая футер.",
    }),
    q({
      id: "hier-05",
      kind: "choice",
      ref: send,
      skills: ["иерархия действий", "размер и положение"],
      prompt: "Google сообщает, что в M3 Expressive кнопку Send находят в 4 раза быстрее. Какой ещё эффект айтрекинга описан в том же исследовании?",
      context:
        "Слева стандартный Material 3: маленькая кнопка Send в верхнем тулбаре. Справа M3 Expressive: кнопка крупнее, над клавиатурой, во вторичном цвете. Замеры на 10 приложениях в двух версиях, порядок случайный.",
      figures: [fig(send, "before"), fig(send, "after")],
      options: opts(
        "Ускорение наблюдалось только у 18–24-летних",
        "Поиск ускорился, но время до нажатия выросло",
        "Возрастной разрыв почти исчез: участники 45+ находили ключевые элементы так же быстро, как молодые",
        "Эффект пропадал, если подписи у действий убраны",
      ),
      sourceAnswer: "c",
      why: "Цифра 87% у 18–24 — это предпочтение, а не скорость. Время до нажатия, по словам авторов, сократилось на секунды.",
      alternatives: ["Вариант про подписи частично связан с источником: удаление подписей у действий ухудшило юзабилити, но это отдельный вывод."],
    }),
    q({
      id: "hier-06",
      kind: "image-choice",
      ref: playlist,
      skills: ["привычные паттерны", "экспрессия против ясности"],
      prompt: "Какой из двух концептов плейлиста показал лучшее юзабилити в исследовании Google?",
      context: "Оба концепта из одного исследования Material 3 Expressive. Подписи под телефонами — из оригинала.",
      options: [
        { id: "a", label: "Обложки разной формы без подписей", asset: fig(playlist, "before") },
        { id: "b", label: "Карусель и вертикальный список", asset: fig(playlist, "after") },
      ],
      sourceAnswer: "b",
      why: "Концепт с разбросанными обложками называли современным, но не узнавали как плейлист; оценки юзабилити упали.",
      alternatives: ["Если вопрос понять как «что выглядит привлекательнее», вариант A тоже получал высокие оценки визуальной привлекательности."],
    }),
    q({
      id: "hier-07",
      kind: "choice",
      ref: grid,
      skills: ["мышечная память", "редизайн"],
      prompt: "В одной из итераций UI3 сетку выравнивания свернули в выпадающий контрол (слева). Почему Figma вернулась к постоянной сетке (справа)?",
      context: "Панель Auto Layout: отклонённая итерация и финальная версия UI3.",
      figures: [fig(grid, "single"), fig(grid, "after")],
      options: opts(
        "Новички не понимали сокращения вроде «L, Top»",
        "Сетка «перемещалась», и опытные пользователи теряли мышечную память; расположение вернули, обновив стиль",
        "Выпадающий контрол не проходил по контрасту",
        "Контрол не работал в браузерной версии",
      ),
      sourceAnswer: "b",
      why: "Сжатие делали ради простоты и доступности, но откатили ради опытных пользователей, сохранив новый визуальный язык.",
    }),
    q({
      id: "hier-08",
      kind: "choice",
      ref: order,
      skills: ["мышечная память", "структура панели"],
      prompt: "Команда Figma считала, что ширина и высота важнее координат X/Y. Что они сделали после тестов?",
      context: "Панель свойств UI3 для фрейма без Auto Layout (слева) и с ним (справа).",
      asset: fig(order, "single"),
      options: opts(
        "Поставили W/H выше X/Y, как в CSS",
        "Вынесли X/Y во всплывающее окно",
        "Объединили W/H и Auto Layout в одну секцию, как в коде, но оставили её ниже X/Y: инверсия ломала мышечную память",
        "Оставили прежнюю структуру панели без изменений",
      ),
      sourceAnswer: "c",
      why: "Ранние тесты показали, что перестановка W/H выше X/Y слишком сильно ломает привычку.",
    }),
  ],
};
