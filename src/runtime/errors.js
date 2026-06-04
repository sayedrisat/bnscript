export class BNRuntimeError extends Error {
  constructor(message, { cause, operation, ...context } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "BNRuntimeError";
    this.cause = cause;
    this.operation = operation;
    this.context = {
      ...context,
      operation,
    };
  }

  format() {
    let output = "BN Script Runtime Error\n\n";

    if (this.operation) {
      output += `Operation: ${this.operation}\n`;
    }

    output += `Message: ${this.message}\n`;
    return output;
  }
}

export function toRuntimeError(message, context = {}) {
  if (context.cause instanceof BNRuntimeError) {
    return context.cause;
  }

  return new BNRuntimeError(message, context);
}
