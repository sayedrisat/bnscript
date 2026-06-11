import test from "node:test";
import assert from "node:assert";
import { compile } from "../src/compiler.js";
import { DIAGNOSTIC_MESSAGES } from "../src/diagnostics/messages.js";

function compileSource(source) {
  const result = compile(source, {
    filename: "test.bn",
  });

  assert.deepStrictEqual(result.diagnostics, []);
  return result.js;
}

test("aliases: Bangla and English declarations generate identical JavaScript", () => {
  const bangla = compileSource(`dhori name = "Risat"
dekhi name`);
  const english = compileSource(`let name = "Risat"
print name`);

  assert.strictEqual(english, bangla);
});

test("aliases: English keywords compile across statements and expressions", () => {
  const output = compileSource(`let name = "Risat"
const ready = true

function greet(person) {
  return "Hello \${person}"
}

if ready and not false {
  print greet(name)
} else {
  print null
}

let i = 0
while i < 2 {
  i += 1
  if i == 1 {
    continue
  }
  break
}`);

  assert.ok(output.includes("let name = \"Risat\";"));
  assert.ok(output.includes("const ready = true;"));
  assert.ok(output.includes("function greet(person)"));
  assert.ok(output.includes("if (ready && !false)"));
  assert.ok(output.includes("continue;"));
  assert.ok(output.includes("break;"));
});

test("aliases: English or operator compiles", () => {
  const output = compileSource(`let ready = false

if ready or true {
  print "ok"
}`);

  assert.ok(output.includes("if (ready || true)"));
});

test("aliases: Bangla logical operators still compile", () => {
  const output = compileSource(`dhori ready = sotti

jodi ready ebong na mittha {
  dekhi "ok"
} nahole jodi ready othoba mittha {
  dekhi "fallback"
}`);

  assert.ok(output.includes("if (ready && !false)"));
  assert.ok(output.includes("} else if (ready || false) {"));
});

test("aliases: mixed logical operators compile", () => {
  const output = compileSource(`let ready = sotti

jodi ready and na false {
  print "mixed"
}`);

  assert.ok(output.includes("if (ready && !false)"));
});

test("aliases: mixed Bangla and English style compiles", () => {
  const output = compileSource(`let name = "Risat"

jodi sotti {
  print name
}`);

  assert.ok(output.includes("let name = \"Risat\";"));
  assert.ok(output.includes("if (true)"));
  assert.ok(output.includes("console.log(name);"));
});

test("aliases: English module and exception keywords compile", () => {
  const output = compileSource(`import { greet } from "./module-utils.bn"

export const APP = "BN"

try {
  print greet(APP)
} catch err {
  print err
} finally {
  print "done"
}`);

  assert.ok(output.includes('import { greet } from "./module-utils.js";'));
  assert.ok(output.includes("export const APP = \"BN\";"));
  assert.ok(output.includes("try {"));
  assert.ok(output.includes("} catch (err) {"));
  assert.ok(output.includes("} finally {"));
});

test("diagnostics: bilingual message foundation exists", () => {
  assert.ok(DIAGNOSTIC_MESSAGES.AWAIT_SCOPE_ERROR.bn);
  assert.ok(DIAGNOSTIC_MESSAGES.AWAIT_SCOPE_ERROR.en);
});
