import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import { access, readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { KEYWORDS, getKeyword } = require("../vscode/src/keywords.js");

const CORE_COMPLETIONS = [
  "dhori",
  "let",
  "sthir",
  "const",
  "dekhi",
  "print",
  "jodi",
  "if",
  "kaj",
  "function",
  "ferot",
  "return",
  "await",
  "true",
  "false",
  "null",
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path) {
  await access(path);
}

test("vscode: keyword registry contains core autocomplete entries", () => {
  const keywords = new Set(KEYWORDS.map((entry) => entry.keyword));

  for (const keyword of CORE_COMPLETIONS) {
    assert.ok(keywords.has(keyword), `missing completion keyword ${keyword}`);
  }
});

test("vscode: keyword registry provides hover documentation", () => {
  const variable = getKeyword("dhori");
  const fn = getKeyword("kaj");
  const awaitKeyword = getKeyword("await");

  assert.strictEqual(variable.title, "BN Script Variable Declaration");
  assert.ok(variable.description_bn.includes("variable"));
  assert.ok(variable.description_en.includes("mutable variable"));
  assert.strictEqual(fn.title, "BN Script Function");
  assert.ok(fn.description_bn.includes("Function"));
  assert.ok(fn.description_en.includes("Defines a function"));
  assert.strictEqual(awaitKeyword.title, "BN Script Await");
  assert.ok(awaitKeyword.description_bn.includes("Async operation"));
  assert.ok(awaitKeyword.description_en.includes("async operation"));
});

test("vscode: keyword registry has no duplicate keywords", () => {
  const keywords = KEYWORDS.map((entry) => entry.keyword);
  const unique = new Set(keywords);

  assert.strictEqual(unique.size, keywords.length);
});

test("vscode: extension manifest activates autocomplete and hover providers", async () => {
  const pkg = await readJson("vscode/package.json");

  assert.strictEqual(pkg.main, "./src/extension.js");
  assert.ok(pkg.activationEvents.includes("onLanguage:bnscript"));
  assert.ok(pkg.files.includes("src/extension.js"));
  assert.ok(pkg.files.includes("src/keywords.js"));

  await exists("vscode/src/extension.js");
  await exists("vscode/src/keywords.js");
});
