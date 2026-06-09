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

test("integration: async fixture compiles async and await", async () => {
  const result = await compileIntegrationFixture("async.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("async function fetchData() {"));
  assert.ok(result.js.includes("async function main() {"));
  assert.ok(result.js.includes("let result = await fetchData();"));
  assert.ok(result.js.includes("main();"));
});
