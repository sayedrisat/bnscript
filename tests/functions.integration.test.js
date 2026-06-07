import test from "node:test";
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compile } from "../src/compiler.js";

test("integration: functions fixture compiles end-to-end", async () => {
  const filePath = join("tests", "integration", "functions.bn");
  const source = await readFile(filePath, "utf8");
  const result = compile(source, { filename: filePath });

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes("function greet(name) {"));
  assert.ok(result.js.includes('return "Hello " + name;'));
  assert.ok(result.js.includes('console.log(greet("Risat"));'));
});
