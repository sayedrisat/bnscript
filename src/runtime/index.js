import { __bn_env } from "./env.js";
import { __bn_fetch, __bn_httpGet } from "./fetch.js";
import { __bn_file } from "./file.js";
import { __bn_wait } from "./wait.js";

export { __bn_fetch, __bn_httpGet } from "./fetch.js";
export { __bn_file } from "./file.js";
export { __bn_env } from "./env.js";
export { __bn_wait } from "./wait.js";
export { BNRuntimeError } from "./errors.js";

export function env(name, defaultValue = undefined) {
  return __bn_env(name, defaultValue);
}

export async function fileRead(path) {
  return await __bn_file.read(path);
}

export async function fileWrite(path, content) {
  await __bn_file.write(path, content);
}

export function wait(ms) {
  return __bn_wait(ms);
}

export async function httpGet(url, options = {}) {
  return await __bn_httpGet(url, options);
}
