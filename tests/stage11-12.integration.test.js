import test from "node:test";
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compile } from "../src/compiler.js";

async function compileIntegrationFixture(name) {
  const filePath = join("tests", "integration", name);
  const source = await readFile(filePath, "utf8");
  return compile(source, { filename: filePath });
}

test("integration: range for fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("for.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("for (let i = 0; i < 5; i++) {"));
  assert.ok(result.js.includes("console.log(i);"));
});

test("integration: foreach fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("foreach.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes('let names = ["Risat","BN","Script"];'));
  assert.ok(result.js.includes("for (const item of names) {"));
  assert.ok(result.js.includes("console.log(item);"));
});
