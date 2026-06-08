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

test("integration: assignments fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("assignments.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("let count = 0;"));
  assert.ok(result.js.includes("count = count + 1;"));
  assert.ok(result.js.includes("count += 4;"));
  assert.ok(result.js.includes("console.log(count);"));
});

test("integration: while fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("while.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("let i = 0;"));
  assert.ok(result.js.includes("while (i < 3) {"));
  assert.ok(result.js.includes("console.log(i);"));
  assert.ok(result.js.includes("i = i + 1;"));
});
