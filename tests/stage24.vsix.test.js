import test from "node:test";
import assert from "node:assert";
import { access, readFile } from "node:fs/promises";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path) {
  await access(path);
}

test("vsix: root package exposes VSIX build script and vsce dev dependency", async () => {
  const pkg = await readJson("package.json");

  assert.ok(pkg.scripts["build:vsix"]);
  assert.ok(pkg.scripts["build:vsix"].includes("vsce package"));
  assert.ok(pkg.devDependencies["@vscode/vsce"]);
});

test("vsix: extension manifest has packageable metadata", async () => {
  const pkg = await readJson("vscode/package.json");
  const language = pkg.contributes.languages[0];
  const grammar = pkg.contributes.grammars[0];

  assert.strictEqual(pkg.name, "bnscript");
  assert.strictEqual(pkg.displayName, "BN Script");
  assert.ok(pkg.description);
  assert.strictEqual(pkg.version, "0.1.0-alpha.0");
  assert.strictEqual(pkg.publisher, "bnscript-dev");
  assert.strictEqual(pkg.icon, "assets/icon.png");
  assert.ok(pkg.engines.vscode);
  assert.deepStrictEqual(pkg.categories, ["Programming Languages"]);
  assert.strictEqual(pkg.repository.url, "https://github.com/sayedrisat/bnscript.git");
  assert.ok(pkg.files.includes("README.md"));
  assert.ok(pkg.files.includes("LICENSE"));
  assert.ok(pkg.files.includes("bnscript.tmLanguage.json"));
  assert.strictEqual(language.id, "bnscript");
  assert.deepStrictEqual(language.extensions, [".bn"]);
  assert.strictEqual(language.configuration, "./language-configuration.json");
  assert.strictEqual(grammar.language, "bnscript");
  assert.strictEqual(grammar.path, "./bnscript.tmLanguage.json");
});

test("vsix: extension package files exist", async () => {
  await exists("vscode/package.json");
  await exists("vscode/bnscript.tmLanguage.json");
  await exists("vscode/language-configuration.json");
  await exists("vscode/assets/icon.png");
  await exists("vscode/README.md");
  await exists("vscode/LICENSE");
});
