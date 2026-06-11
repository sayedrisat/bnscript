import test from "node:test";
import assert from "node:assert";
import { compile } from "../src/compiler.js";
import { formatDiagnostic } from "../src/diagnostics/messages.js";

function firstDiagnostic(source) {
  const result = compile(source, {
    filename: "diagnostic.bn",
  });

  assert.ok(result.diagnostics.length > 0);
  return result.diagnostics[0];
}

function assertBilingualDiagnostic(diagnostic, englishText) {
  const text = `${diagnostic.message}\n${diagnostic.format()}`;

  assert.ok(text.includes("BNError:"));
  assert.ok(text.includes("Bangla:"));
  assert.ok(text.includes("English:"));
  assert.ok(text.includes("Hint:"));
  assert.ok(text.includes(englishText));
}

test("diagnostics: formatter renders bilingual sections and hint", () => {
  const message = formatDiagnostic("UNDECLARED_VARIABLE", {
    name: "name",
  });

  assert.ok(message.includes("BNError:"));
  assert.ok(message.includes("Bangla:"));
  assert.ok(message.includes("English:"));
  assert.ok(message.includes("Hint:"));
  assert.ok(message.includes("let name = ..."));
});

test("diagnostics: undeclared variable message is bilingual", () => {
  assertBilingualDiagnostic(
    firstDiagnostic("dekhi name"),
    'Use before declaration: "name" is not declared.'
  );
});

test("diagnostics: const reassignment message is bilingual", () => {
  assertBilingualDiagnostic(
    firstDiagnostic(`sthir limit = 1
limit = 2`),
    'Cannot reassign constant "limit".'
  );
});

test("diagnostics: await scope message is bilingual", () => {
  assertBilingualDiagnostic(
    firstDiagnostic(`kaj load() {
  await wait(1)
}`),
    'Cannot use "await" inside a non-async function.'
  );
});

test("diagnostics: break outside loop message is bilingual", () => {
  assertBilingualDiagnostic(
    firstDiagnostic("bekkhon"),
    'Cannot use "bekkhon" outside a loop.'
  );
});

test("diagnostics: continue outside loop message is bilingual", () => {
  assertBilingualDiagnostic(
    firstDiagnostic("cholo"),
    'Cannot use "cholo" outside a loop.'
  );
});
