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

test("integration: break fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("break.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("for (let i = 0; i < 10; i++) {"));
  assert.ok(result.js.includes("if (i === 5) {"));
  assert.ok(result.js.includes("break;"));
});

test("integration: continue fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("continue.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("for (let i = 0; i < 5; i++) {"));
  assert.ok(result.js.includes("if (i === 2) {"));
  assert.ok(result.js.includes("continue;"));
});
