import test from "node:test";
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { compile } from "../src/compiler.js";

const KEYWORDS = [
  "dhori",
  "sthir",
  "dekhi",
  "jodi",
  "nahole",
  "jotokkhon",
  "bar",
  "theke",
  "ekti",
  "amdani",
  "roptani",
  "async",
  "await",
  "kaj",
  "ferot",
  "bekkhon",
  "cholo",
  "dhoro",
  "error",
  "sheshe",
  "sotti",
  "mittha",
  "khali",
  "ebong",
  "othoba",
  "na",
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("syntax: vscode language package associates .bn files", async () => {
  const pkg = await readJson("vscode/package.json");

  assert.strictEqual(pkg.contributes.languages[0].id, "bnscript");
  assert.deepStrictEqual(pkg.contributes.languages[0].extensions, [".bn"]);
  assert.strictEqual(pkg.contributes.grammars[0].language, "bnscript");
  assert.strictEqual(pkg.contributes.grammars[0].scopeName, "source.bnscript");
  assert.strictEqual(
    pkg.contributes.grammars[0].path,
    "./bnscript.tmLanguage.json"
  );
});

test("syntax: textmate grammar covers BN Script token groups", async () => {
  const grammar = await readJson("vscode/bnscript.tmLanguage.json");
  const grammarText = JSON.stringify(grammar);

  assert.strictEqual(grammar.scopeName, "source.bnscript");
  for (const keyword of KEYWORDS) {
    assert.ok(grammarText.includes(keyword), `missing keyword ${keyword}`);
  }

  for (const scope of [
    "comment.line.double-slash.bnscript",
    "comment.block.bnscript",
    "string.quoted.double.bnscript",
    "constant.numeric.bnscript",
    "keyword.operator.arithmetic.bnscript",
    "entity.name.function.bnscript",
    "variable.other.import.bnscript",
    "variable.other.export.bnscript",
  ]) {
    assert.ok(grammarText.includes(scope), `missing scope ${scope}`);
  }
});

test("syntax: language configuration parses", async () => {
  const configuration = await readJson("vscode/language-configuration.json");

  assert.strictEqual(configuration.comments.lineComment, "//");
  assert.deepStrictEqual(configuration.comments.blockComment, ["/*", "*/"]);
  assert.ok(configuration.brackets.some(([open, close]) => open === "{" && close === "}"));
});

test("syntax: showcase example compiles", async () => {
  const source = await readFile("examples/syntax-highlighting.bn", "utf8");
  const result = compile(source, {
    filename: "examples/syntax-highlighting.bn",
  });

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes('import { greet } from "./module-utils.js";'));
  assert.ok(result.js.includes("export const APP"));
  assert.ok(result.js.includes("export async function loadGreeting"));
  assert.ok(result.js.includes("await runtime.httpGet"));
});
