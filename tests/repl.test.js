import test from "node:test";
import assert from "node:assert";
import { REPL_HELP, ReplSession, VERSION } from "../src/repl.js";

function memoryStream() {
  return {
    text: "",
    write(chunk) {
      this.text += String(chunk);
    },
  };
}

function memoryIO() {
  return {
    stdout: memoryStream(),
    stderr: memoryStream(),
  };
}

test("repl: help command", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  const result = await session.handleLine(".help");

  assert.strictEqual(result.exit, false);
  assert.strictEqual(io.stdout.text, `${REPL_HELP}\n`);
  assert.strictEqual(io.stderr.text, "");
});

test("repl: exit command", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  const result = await session.handleLine(".exit");

  assert.strictEqual(result.exit, true);
  assert.strictEqual(io.stdout.text, "");
  assert.strictEqual(io.stderr.text, "");
});

test("repl: version command", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  await session.handleLine(".version");

  assert.strictEqual(io.stdout.text, `${VERSION}\n`);
  assert.strictEqual(io.stderr.text, "");
});

test("repl: clear command", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  await session.handleLine(".clear");

  assert.strictEqual(io.stdout.text, "\x1Bc");
  assert.strictEqual(io.stderr.text, "");
});

test("repl: print statement", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  await session.handleLine('dekhi "Hello"');

  assert.strictEqual(io.stdout.text, "Hello\n");
  assert.strictEqual(io.stderr.text, "");
});

test("repl: variable persistence", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  await session.handleLine("dhori x = 10");
  await session.handleLine("dhori y = 20");
  await session.handleLine("dekhi x + y");

  assert.strictEqual(io.stdout.text, "30\n");
  assert.strictEqual(io.stderr.text, "");
});

test("repl: top-level await", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  const result = await session.handleLine("await wait(1)");

  assert.strictEqual(result.ok, true);
  assert.strictEqual(io.stdout.text, "");
  assert.strictEqual(io.stderr.text, "");
});

test("repl: top-level await declaration persists", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  await session.handleLine("dhori done = await wait(1)");
  await session.handleLine("dekhi done");

  assert.strictEqual(io.stdout.text, "undefined\n");
  assert.strictEqual(io.stderr.text, "");
});

test("repl: compile error recovery", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  const errorResult = await session.handleLine("dhori = 1");
  await session.handleLine('dekhi "after"');

  assert.strictEqual(errorResult.ok, false);
  assert.ok(io.stderr.text.includes("ParseError"));
  assert.ok(io.stderr.text.includes("Expected variable name"));
  assert.strictEqual(io.stdout.text, "after\n");
});

test("repl: runtime error recovery", async () => {
  const io = memoryIO();
  const session = new ReplSession({ io });

  await session.handleLine("dhori x = 10");
  const errorResult = await session.handleLine("dekhi khali.name");
  await session.handleLine("dekhi x");

  assert.strictEqual(errorResult.ok, false);
  assert.ok(io.stderr.text.includes("Runtime Error:"));
  assert.ok(io.stderr.text.includes("Cannot read"));
  assert.strictEqual(io.stdout.text, "10\n");
});
