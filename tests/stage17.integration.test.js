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

test("integration: runtime helper fixture compiles helper calls", async () => {
  const result = await compileIntegrationFixture("runtime.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(
    result.js.includes('import * as runtime from "./src/runtime/index.js";')
  );
  assert.ok(result.js.includes('let user = runtime.env("USER");'));
  assert.ok(result.js.includes('await runtime.fileWrite("runtime-output.txt", "BN Script");'));
  assert.ok(result.js.includes('let content = await runtime.fileRead("runtime-output.txt");'));
  assert.ok(result.js.includes("await runtime.wait(1);"));
  assert.ok(result.js.includes("await runtime.httpGet("));
});
