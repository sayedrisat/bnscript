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

test("integration: module utils fixture compiles exports", async () => {
  const result = await compileIntegrationFixture("module-utils.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("export function greet(name) {"));
  assert.ok(result.js.includes('export let version = "0.1";'));
  assert.ok(result.js.includes('export const APP = "BN";'));
});

test("integration: module main fixture compiles imports", async () => {
  const result = await compileIntegrationFixture("module-main.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(
    result.js.includes('import { greet, version } from "./module-utils.js";')
  );
  assert.ok(!result.js.includes("./module-utils.bn"));
  assert.ok(result.js.includes("greet(version);"));
});
