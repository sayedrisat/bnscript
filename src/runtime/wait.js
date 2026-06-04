import { BNRuntimeError } from "./errors.js";

export const MAX_WAIT_MS = 300000;

export function __bn_wait(ms) {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(
      new BNRuntimeError(`wait() expects a non-negative number, got: ${ms}`, {
        operation: "wait",
        value: ms,
      })
    );
  }

  if (ms > MAX_WAIT_MS) {
    return Promise.reject(
      new BNRuntimeError(`wait() maximum is ${MAX_WAIT_MS}ms, got: ${ms}`, {
        operation: "wait",
        value: ms,
      })
    );
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
