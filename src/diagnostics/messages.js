export const DIAGNOSTIC_MESSAGES = {
  UNDECLARED_VARIABLE: {
    bn: 'Variable "{name}" age declare kora hoyni.',
    en: 'Use before declaration: "{name}" is not declared.',
    hint: 'Prothome:\ndhori {name} = ...\nba\nlet {name} = ...\nlikhun.',
  },
  DUPLICATE_DECLARATION: {
    bn: '"{name}" eki scope e agey declare kora hoyeche.',
    en: 'Duplicate declaration of "{name}" in the same scope.',
    hint: 'Naam bodol korun, ba agey kora declaration remove korun.',
  },
  CONST_REASSIGNMENT: {
    bn: 'Constant "{name}" abar assign kora jabe na.',
    en: 'Cannot reassign constant "{name}".',
    hint: 'Jodi value change korte hoy, "sthir" er bodole "dhori" ba "let" use korun.',
  },
  AWAIT_SCOPE_ERROR: {
    bn: '"await" non-async kaj er vitore use kora jabe na.',
    en: 'Cannot use "await" inside a non-async function.',
    hint: 'Function ke "async kaj" / "async function" korun, ba await top-level code e rakhun.',
  },
  RETURN_OUTSIDE_FUNCTION: {
    bn: '"ferot" / "return" sudhu function er vitore use kora jay.',
    en: 'Cannot use "ferot" at the top level.',
    hint: '"ferot" ke "kaj" / "function" body er vitore nin.',
  },
  BREAK_OUTSIDE_LOOP: {
    bn: '"bekkhon" / "break" sudhu loop er vitore use kora jay.',
    en: 'Cannot use "bekkhon" outside a loop.',
    hint: '"bekkhon" ke "bar", "for", "jotokkhon", ba "while" loop er vitore rakhun.',
  },
  CONTINUE_OUTSIDE_LOOP: {
    bn: '"cholo" / "continue" sudhu loop er vitore use kora jay.',
    en: 'Cannot use "cholo" outside a loop.',
    hint: '"cholo" ke "bar", "for", "jotokkhon", ba "while" loop er vitore rakhun.',
  },
  DUPLICATE_PARAMETER: {
    bn: 'Function "{functionName}" e parameter "{name}" duplicate.',
    en: 'Duplicate parameter "{name}" in function "{functionName}".',
    hint: 'Prottek parameter er alada naam din.',
  },
  IMPORT_ERROR: {
    bn: 'Import statement thik noy.',
    en: "{message}",
    hint: 'Use: amdani { greet } theke "./utils.bn" ba import { greet } from "./utils.bn".',
  },
  EXPORT_ERROR: {
    bn: 'Export statement thik noy.',
    en: "{message}",
    hint: 'Use: roptani/export with kaj/function, dhori/let, or sthir/const.',
  },
};

function interpolate(template, details) {
  return String(template).replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => {
    if (details[key] === undefined || details[key] === null) {
      return "";
    }

    return String(details[key]);
  });
}

export function formatDiagnostic(code, details = {}) {
  const template = DIAGNOSTIC_MESSAGES[code] || {
    bn: "Compiler error hoyeche.",
    en: details.message || "Compiler error.",
    hint: "Code ta check kore abar try korun.",
  };

  const bn = interpolate(template.bn, details);
  const en = interpolate(template.en, details);
  const hint = interpolate(template.hint, details);

  return `BNError:\n\nBangla:\n${bn}\n\nEnglish:\n${en}\n\nHint:\n${hint}`;
}

export default DIAGNOSTIC_MESSAGES;
