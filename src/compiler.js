import { tokenize } from "./lexer.js";
import { parse } from "./parser.js";
import { analyze } from "./analyzer.js";
import { generate } from "./generator.js";

function collectDiagnostics(error) {
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors;
  }

  return error ? [error] : [];
}

export function compile(source, options = {}) {
  const filename = options.filename || "<anonymous>";
  let ast = null;
  let js = null;
  let diagnostics = [];

  try {
    const tokens = tokenize(source, filename);
    ast = parse(tokens, { filename, source });
    analyze(ast, { filename, source });
    js = generate(ast, {
      filename,
      runtimeImport: options.runtimeImport,
    });
  } catch (error) {
    diagnostics = collectDiagnostics(error);
  }

  return {
    ast,
    js,
    diagnostics,
  };
}
