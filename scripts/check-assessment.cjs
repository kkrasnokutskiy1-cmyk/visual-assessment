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
if (!assessment) errors.push('Асессмент отсутствует в реестре.');
else {
  const ids = new Set();
  if (!assessment.blocks.length) errors.push(`В версии ${assessment.version} нет блоков.`);
  for (const block of assessment.blocks) {
    if (!block.questions.length) errors.push(`${block.id}: нет заданий.`);
    for (const q of block.questions) {
      const fail = (message) => errors.push(`${q.id}: ${message}`);
      if (ids.has(q.id)) fail('повторяется ID');
      ids.add(q.id);
      if (!q.refId || !q.source?.url || !q.source?.title || !q.source?.author) fail('неполная ссылка на первоисточник или автора');
      else if (!getReference(q.refId)) fail('источник отсутствует в реестре');
      if (!['choice', 'image-choice'].includes(q.kind)) fail('недопустимый тип задания');
      const images = [q.asset, ...(q.figures || []), ...(q.options || []).map((o) => o.asset)].filter(Boolean);
      if (!images.length) fail('нет изображения');
      if (q.kind === 'image-choice' && (q.options || []).some((o) => !o.asset)) fail('для сравнения нужны изображения всех вариантов');
      for (const image of images) {
        if (!image.alt || !image.credit || !image.originUrl || !image.license) fail('не заполнены описание, авторство, ссылка или условия изображения');
        if (!image.width || !image.height) fail('не указаны размеры изображения');
        if (image.src?.startsWith('/')) {
          const asset = path.resolve(root, 'public', '.' + image.src);
          if (!asset.startsWith(path.join(root, 'public') + path.sep) || !fs.existsSync(asset)) fail(`файл изображения не найден: ${image.src}`);
        } else if (!/^https:\/\//.test(image.src || '')) fail('неверный адрес изображения');
      }
    }
  }
  if (!ids.size) errors.push(`В версии ${assessment.version} нет заданий.`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Структура версии ${assessment.version} проверена. Доступность источников, права и содержание требуют отдельной проверки.`);
