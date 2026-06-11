import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { COMMANDS } = require("../vscode/src/commands.js");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("vscode commands: registry contains current file commands", () => {
  assert.deepStrictEqual(
    COMMANDS.map((command) => command.id),
    [
      "bnscript.checkCurrentFile",
      "bnscript.buildCurrentFile",
      "bnscript.runCurrentFile",
    ]
  );

  assert.deepStrictEqual(
    COMMANDS.map((command) => command.action),
    ["check", "build", "run"]
  );
});

test("vscode commands: package contributes command palette entries", async () => {
  const pkg = await readJson("vscode/package.json");
  const contributed = pkg.contributes.commands;

  assert.ok(Array.isArray(contributed));

  for (const command of COMMANDS) {
    const entry = contributed.find((item) => item.command === command.id);
    assert.ok(entry, `missing contributed command ${command.id}`);
    assert.strictEqual(entry.title, command.title);
    assert.strictEqual(entry.category, "BN Script");
    assert.ok(pkg.activationEvents.includes(`onCommand:${command.id}`));
  }
});

test("vscode commands: package includes command implementation files", async () => {
  const pkg = await readJson("vscode/package.json");

  assert.ok(pkg.files.includes("src/commands.js"));
  assert.ok(pkg.files.includes("src/extension.js"));
});

test("vscode commands: extension registers commands and output channel", async () => {
  const source = await readFile("vscode/src/extension.js", "utf8");

  assert.ok(source.includes('const OUTPUT_CHANNEL_NAME = "BN Script Output"'));
  assert.ok(source.includes("vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME)"));
  assert.ok(source.includes('require("./commands")'));
  assert.ok(source.includes("vscode.commands.registerCommand"));
  assert.ok(source.includes("registerBnScriptCommand"));
  assert.ok(source.includes("COMMANDS.map"));
});
