import test from "node:test";
import assert from "node:assert";
import { access, readFile } from "node:fs/promises";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path) {
  await access(path);
}

test("vscode diagnostics: provider file exists and is packaged", async () => {
  const pkg = await readJson("vscode/package.json");

  assert.ok(pkg.files.includes("src/diagnostics.js"));
  await exists("vscode/src/diagnostics.js");
});

test("vscode diagnostics: provider creates diagnostic collection", async () => {
  const source = await readFile("vscode/src/diagnostics.js", "utf8");

  assert.ok(source.includes('const DIAGNOSTIC_COLLECTION_NAME = "bnscript"'));
  assert.ok(source.includes("vscode.languages.createDiagnosticCollection"));
  assert.ok(source.includes("collection.set(document.uri, diagnostics)"));
  assert.ok(source.includes("vscode.DiagnosticSeverity.Error"));
});

test("vscode diagnostics: provider registers live validation hooks", async () => {
  const source = await readFile("vscode/src/diagnostics.js", "utf8");

  assert.ok(source.includes("onDidOpenTextDocument"));
  assert.ok(source.includes("onDidSaveTextDocument"));
  assert.ok(source.includes("onDidCloseTextDocument"));
  assert.ok(source.includes("validateDocument(context, collection, document)"));
});

test("vscode diagnostics: provider maps compiler diagnostics to ranges", async () => {
  const source = await readFile("vscode/src/diagnostics.js", "utf8");

  assert.ok(source.includes("function diagnosticRange"));
  assert.ok(source.includes("diagnostic.line"));
  assert.ok(source.includes("diagnostic.column"));
  assert.ok(source.includes("new vscode.Diagnostic"));
  assert.ok(source.includes('item.source = "BN Script"'));
});

test("vscode diagnostics: extension activation wires diagnostics", async () => {
  const source = await readFile("vscode/src/extension.js", "utf8");

  assert.ok(source.includes('require("./diagnostics")'));
  assert.ok(source.includes("registerDiagnostics(context)"));
});
