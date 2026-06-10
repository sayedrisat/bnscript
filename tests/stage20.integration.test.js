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

test("integration: top-level await fixture compiles runtime helper await", async () => {
  const result = await compileIntegrationFixture("top-level-await.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(
    result.js.includes('import * as runtime from "./src/runtime/index.js";')
  );
  assert.ok(result.js.includes("await runtime.wait(10);"));
  assert.ok(result.js.includes('console.log("done");'));
});
