// Validate the current published bank without bundling server-only interpretation into the UI.
/* eslint-disable @typescript-eslint/no-require-imports -- the loader compiles the bank to CommonJS for this standalone check */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...args);
};
require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};
const { getAssessment } = require('../content/assessments/index.ts');
const { getReference } = require('../content/research/index.ts');
const assessment = getAssessment('visual-foundations');
const errors = [];
const filled = (value) => typeof value === 'string' && value.trim().length > 0;
const filledList = (values) => Array.isArray(values) && values.length > 0 && values.every(filled);
if (!assessment) errors.push('Асессмент отсутствует в реестре.');
else {
  const ids = new Set();
  const blockIds = new Set();
  const skillCoverage = new Map();
  if (!assessment.blocks.length) errors.push(`В версии ${assessment.version} нет блоков.`);
  for (const block of assessment.blocks) {
    if (!filled(block.id) || blockIds.has(block.id)) errors.push(`${block.id || 'Блок без ID'}: пустой или повторяющийся ID блока.`);
    blockIds.add(block.id);
    if (!filled(block.title) || !filled(block.description) || !filledList(block.skills)) errors.push(`${block.id}: неполное описание блока или список навыков.`);
    if (!block.questions.length) errors.push(`${block.id}: нет заданий.`);
    for (const q of block.questions) {
      const fail = (message) => errors.push(`${q.id}: ${message}`);
      if (!filled(q.id) || ids.has(q.id)) fail('пустой или повторяющийся ID');
      ids.add(q.id);
      if (!Number.isInteger(q.version) || q.version < 1) fail('некорректная версия вопроса');
      if (!filled(q.prompt) || !filled(q.context) || !filledList(q.skills)) fail('не заполнены вопрос, контекст или навыки');
      for (const skill of q.skills || []) skillCoverage.set(skill, (skillCoverage.get(skill) || 0) + 1);
      if (!q.refId || !q.source?.url || !q.source?.title || !q.source?.author) fail('неполная ссылка на первоисточник или автора');
      else {
        const reference = getReference(q.refId);
        if (!reference) fail('источник отсутствует в реестре');
        else if (q.source.url !== reference.url || q.source.author !== reference.author) fail('ссылка или автор не совпадают с реестром источников');
      }
      if (!filled(q.source?.license)) fail('не указаны условия использования источника');
      if (!['choice', 'image-choice'].includes(q.kind)) fail('недопустимый тип задания');
      if (!Array.isArray(q.options) || q.options.length < 2) fail('нужно не менее двух вариантов ответа');
      else {
        const optionIds = new Set();
        for (const option of q.options) {
          if (!filled(option.id) || optionIds.has(option.id)) fail('пустой или повторяющийся ID варианта');
          optionIds.add(option.id);
          if (!filled(option.label) && !option.asset) fail('у варианта нет текста или изображения');
          if (q.kind === 'choice' && !filled(option.label)) fail('текстовому варианту нужна подпись');
        }
      }
      if (!filled(q.interpretation?.observation) || !filledList(q.interpretation?.explanations) || !Array.isArray(q.interpretation?.alternatives) || !q.interpretation.alternatives.every(filled)) fail('неполные критерии интерпретации');
      const images = [q.asset, ...(q.figures || []), ...(q.options || []).map((o) => o.asset)].filter(Boolean);
      if (!images.length) fail('нет изображения');
      if (q.kind === 'image-choice' && (q.options || []).some((o) => !o.asset)) fail('для сравнения нужны изображения всех вариантов');
      for (const image of images) {
        if (![image.alt, image.credit, image.originUrl, image.license].every(filled)) fail('не заполнены описание, авторство, ссылка или условия изображения');
        if (!Number.isFinite(image.width) || image.width <= 0 || !Number.isFinite(image.height) || image.height <= 0) fail('не указаны корректные размеры изображения');
        if (image.src?.startsWith('/')) {
          const asset = path.resolve(root, 'public', '.' + image.src);
          if (!asset.startsWith(path.join(root, 'public') + path.sep) || !fs.existsSync(asset)) fail(`файл изображения не найден: ${image.src}`);
        } else if (!/^https:\/\//.test(image.src || '')) fail('неверный адрес изображения');
      }
    }
  }
  if (!ids.size) errors.push(`В версии ${assessment.version} нет заданий.`);
  if (!errors.length) {
    const coverage = [...skillCoverage].sort((a, b) => a[0].localeCompare(b[0], 'ru')).map(([skill, count]) => `${skill}: ${count}`).join(', ');
    console.log(`Версия ${assessment.version}: ${assessment.blocks.length} блоков, ${ids.size} заданий. Покрытие навыков: ${coverage}.`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Структура версии ${assessment.version} проверена. Доступность источников, права и содержание требуют отдельной проверки.`);
