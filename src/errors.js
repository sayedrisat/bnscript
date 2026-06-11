export class BNError extends Error {
  constructor({ category, message, filename, line, column, sourceLine, suggestion, code, details }) {
    super(message);
    this.name = "BNError";
    this.category = category || "Error";
    this.filename = filename || "<anonymous>";
    this.line = line;
    this.column = column;
    this.sourceLine = sourceLine;
    this.suggestion = suggestion;
    this.code = code;
    this.details = details;
  }

  format() {
    let out = `╔══════════════════════════════════════════╗\n`;
    out += `║  BN Script Error                         ║\n`;
    out += `╚══════════════════════════════════════════╝\n\n`;
    out += `  [${this.category}] in ${this.filename}\n`;
    
    if (this.line !== undefined) {
      out += `\n  Line ${this.line}:\n`;
      out += `  │\n`;
      if (this.sourceLine !== undefined) {
        out += `  │   ${this.sourceLine}\n`;
        if (this.column !== undefined) {
          const padding = " ".repeat(Math.max(0, this.column - 1));
          out += `  │   ${padding}^\n`;
        }
      }
    }

    out += `\n  ${this.message}\n`;

    if (this.suggestion) {
      out += `\n  Suggestion:\n`;
      out += `    ${this.suggestion}\n`;
    }

    return out;
  }
}

export function createError(options) {
  return new BNError(options);
}
