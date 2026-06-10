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

test("integration: try fixture compiles try catch finally", async () => {
  const result = await compileIntegrationFixture("try.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("try {"));
  assert.ok(result.js.includes("} catch (err) {"));
  assert.ok(result.js.includes("} finally {"));
});
