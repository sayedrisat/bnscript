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

test("integration: arrays fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("arrays.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(result.js.includes('let names = ["Risat","BN"];'));
  assert.ok(result.js.includes("console.log(names[0]);"));
  assert.ok(result.js.includes('names[1] = "Script";'));
  assert.ok(result.js.includes("let matrix = [[1],[2,3]];"));
  assert.ok(result.js.includes("console.log(matrix[1][0]);"));
});

test("integration: objects fixture compiles end-to-end", async () => {
  const result = await compileIntegrationFixture("objects.bn");

  assert.strictEqual(result.diagnostics.length, 0);
  assert.ok(
    result.js.includes(
      'let user = { name: "Risat", profile: { city: "Dhaka" } };'
    )
  );
  assert.ok(result.js.includes("console.log(user.name);"));
  assert.ok(result.js.includes("console.log(user.profile.city);"));
  assert.ok(result.js.includes('user.name = "Sayed";'));
  assert.ok(result.js.includes('let users = [{ name: "BN" }];'));
  assert.ok(result.js.includes("console.log(users[0].name);"));
});
