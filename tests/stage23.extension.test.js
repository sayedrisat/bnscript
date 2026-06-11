import test from "node:test";
import assert from "node:assert";
import { access, readFile } from "node:fs/promises";
import { compile } from "../src/compiler.js";

const REQUIRED_KEYWORDS = [
  "dhori",
  "let",
  "sthir",
  "const",
  "dekhi",
  "print",
  "jodi",
  "if",
  "nahole",
  "else",
  "jotokkhon",
  "while",
  "bar",
  "for",
  "theke",
  "from",
  "to",
  "ekti",
  "of",
  "amdani",
  "import",
  "roptani",
  "export",
  "async",
  "await",
  "kaj",
  "function",
  "ferot",
  "return",
  "bekkhon",
  "break",
  "cholo",
  "continue",
  "dhoro",
  "try",
  "error",
  "catch",
  "sheshe",
  "finally",
  "sotti",
  "true",
  "mittha",
  "false",
  "khali",
  "null",
  "ebong",
  "and",
  "othoba",
  "or",
  "na",
  "not",
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path) {
  await access(path);
}

test("extension: package manifest has installable VS Code metadata", async () => {
  const pkg = await readJson("vscode/package.json");

  assert.strictEqual(pkg.name, "bnscript");
  assert.strictEqual(pkg.displayName, "BN Script");
  assert.strictEqual(pkg.publisher, "bnscript-dev");
  assert.strictEqual(pkg.license, "MIT");
  assert.strictEqual(pkg.repository.url, "https://github.com/sayedrisat/bnscript.git");
  assert.deepStrictEqual(pkg.categories, ["Programming Languages"]);
  assert.ok(pkg.engines.vscode);
});

test("extension: language, grammar, config, and icon paths exist", async () => {
  const pkg = await readJson("vscode/package.json");
  const language = pkg.contributes.languages[0];
  const grammar = pkg.contributes.grammars[0];

  assert.strictEqual(language.id, "bnscript");
  assert.deepStrictEqual(language.extensions, [".bn"]);
  assert.strictEqual(language.configuration, "./language-configuration.json");
  assert.strictEqual(grammar.language, "bnscript");
  assert.strictEqual(grammar.path, "./bnscript.tmLanguage.json");
  assert.strictEqual(pkg.icon, "assets/icon.png");

  await exists("vscode/language-configuration.json");
  await exists("vscode/bnscript.tmLanguage.json");
  await exists("vscode/assets/icon.png");
});

test("extension: grammar includes current BN Script keywords", async () => {
  const grammar = await readJson("vscode/bnscript.tmLanguage.json");
  const grammarText = JSON.stringify(grammar);

  for (const keyword of REQUIRED_KEYWORDS) {
    assert.ok(grammarText.includes(keyword), `missing keyword ${keyword}`);
  }
});

test("extension: sample demo compiles", async () => {
  const source = await readFile("vscode/samples/demo.bn", "utf8");
  const result = compile(source, {
    filename: "vscode/samples/demo.bn",
  });

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes('import { greet } from "./module-utils.js";'));
  assert.ok(result.js.includes("export const APP"));
  assert.ok(result.js.includes("await runtime.httpGet"));
});
