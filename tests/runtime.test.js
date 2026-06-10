import test from "node:test";
import assert from "node:assert";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  BNRuntimeError,
  env,
  fileRead,
  fileWrite,
  httpGet,
  wait,
  __bn_env,
  __bn_fetch,
  __bn_file,
  __bn_wait,
} from "../src/runtime/index.js";

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), "bnscript-runtime-"));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test("runtime: env existing value", (t) => {
  const oldValue = process.env.BN_RUNTIME_TEST_VALUE;
  process.env.BN_RUNTIME_TEST_VALUE = "available";

  t.after(() => {
    if (oldValue === undefined) {
      delete process.env.BN_RUNTIME_TEST_VALUE;
    } else {
      process.env.BN_RUNTIME_TEST_VALUE = oldValue;
    }
  });

  assert.strictEqual(__bn_env("BN_RUNTIME_TEST_VALUE"), "available");
});

test("runtime: env default value", (t) => {
  const oldValue = process.env.BN_RUNTIME_MISSING_VALUE;
  delete process.env.BN_RUNTIME_MISSING_VALUE;

  t.after(() => {
    if (oldValue !== undefined) {
      process.env.BN_RUNTIME_MISSING_VALUE = oldValue;
    }
  });

  assert.strictEqual(__bn_env("BN_RUNTIME_MISSING_VALUE", "fallback"), "fallback");
});

test("runtime: public env helper", (t) => {
  const oldValue = process.env.BN_PUBLIC_ENV_TEST;
  process.env.BN_PUBLIC_ENV_TEST = "public";

  t.after(() => {
    if (oldValue === undefined) {
      delete process.env.BN_PUBLIC_ENV_TEST;
    } else {
      process.env.BN_PUBLIC_ENV_TEST = oldValue;
    }
  });

  assert.strictEqual(env("BN_PUBLIC_ENV_TEST"), "public");
});

test("runtime: wait success", async () => {
  await __bn_wait(1);
  assert.ok(true);
});

test("runtime: public wait helper", async () => {
  await wait(1);
  assert.ok(true);
});

test("runtime: wait invalid value", async () => {
  await assert.rejects(() => __bn_wait(-1), (error) => {
    assert.ok(error instanceof BNRuntimeError);
    assert.strictEqual(error.operation, "wait");
    assert.ok(error.message.includes("non-negative number"));
    return true;
  });

  await assert.rejects(() => __bn_wait(300001), (error) => {
    assert.ok(error instanceof BNRuntimeError);
    assert.strictEqual(error.operation, "wait");
    assert.ok(error.message.includes("maximum"));
    return true;
  });
});

test("runtime: file write and read", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "message.txt");

  await __bn_file.write(filePath, "hello");

  assert.strictEqual(await __bn_file.read(filePath), "hello");
});

test("runtime: public fileRead and fileWrite helpers", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "public-message.txt");

  await fileWrite(filePath, "hello public");

  assert.strictEqual(await fileRead(filePath), "hello public");
});

test("runtime: file append", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "log.txt");

  await __bn_file.write(filePath, "one");
  await __bn_file.append(filePath, "\ntwo");

  assert.strictEqual(await __bn_file.read(filePath), "one\ntwo");
});

test("runtime: file exists", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "exists.txt");

  assert.strictEqual(await __bn_file.exists(filePath), false);

  await __bn_file.write(filePath, "yes");

  assert.strictEqual(await __bn_file.exists(filePath), true);
});

test("runtime: file delete", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "delete.txt");

  await __bn_file.write(filePath, "remove me");
  await __bn_file.delete(filePath);

  assert.strictEqual(await __bn_file.exists(filePath), false);
});

test("runtime: file list", async (t) => {
  const dir = await withTempDir(t);

  await __bn_file.write(join(dir, "a.txt"), "a");
  await __bn_file.write(join(dir, "b.txt"), "b");

  const files = await __bn_file.list(dir);
  assert.deepStrictEqual(files.sort(), ["a.txt", "b.txt"]);
});

test("runtime: readJSON", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "data.json");

  await __bn_file.write(filePath, '{"name":"BN","count":2}');

  assert.deepStrictEqual(await __bn_file.readJSON(filePath), {
    name: "BN",
    count: 2,
  });
});

test("runtime: writeJSON", async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, "data.json");

  await __bn_file.writeJSON(filePath, { name: "BN", count: 2 });

  assert.strictEqual(
    await readFile(filePath, "utf8"),
    '{\n  "name": "BN",\n  "count": 2\n}'
  );
});

test("runtime: fetch parses JSON without internet", async (t) => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: {
      get: () => "application/json",
    },
    json: async () => ({ ok: true }),
    text: async () => "unused",
  });

  t.after(() => {
    globalThis.fetch = oldFetch;
  });

  assert.deepStrictEqual(await __bn_fetch("https://example.test/data"), {
    ok: true,
  });
});

test("runtime: public httpGet helper returns text", async (t) => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: {
      get: () => "application/json",
    },
    text: async () => "{\"ok\":true}",
  });

  t.after(() => {
    globalThis.fetch = oldFetch;
  });

  assert.strictEqual(await httpGet("https://example.test/data"), "{\"ok\":true}");
});

test("runtime: fetch wraps failed requests", async (t) => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    statusText: "Server Error",
    headers: {
      get: () => "text/plain",
    },
    json: async () => ({}),
    text: async () => "error",
  });

  t.after(() => {
    globalThis.fetch = oldFetch;
  });

  await assert.rejects(() => __bn_fetch("https://example.test/fail"), (error) => {
    assert.ok(error instanceof BNRuntimeError);
    assert.strictEqual(error.operation, "fetch");
    assert.strictEqual(error.context.status, 500);
    return true;
  });
});
