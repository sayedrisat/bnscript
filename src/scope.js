export class Scope {
  constructor({ parent = null, type = "block" } = {}) {
    this.parent = parent;
    this.type = type;
    this.symbols = new Map();
  }

  declare(name, symbol) {
    if (this.symbols.has(name)) {
      return {
        ok: false,
        existing: this.symbols.get(name),
      };
    }

    const entry = {
      name,
      kind: symbol.kind,
      mutable: symbol.mutable,
      declaration: symbol.declaration,
      line: symbol.line,
      column: symbol.column,
      scope: this,
      used: false,
    };
    this.symbols.set(name, entry);

    return {
      ok: true,
      symbol: entry,
    };
  }

  resolve(name) {
    let scope = this;
    let depth = 0;

    while (scope) {
      const symbol = scope.symbols.get(name);
      if (symbol) {
        return { symbol, scope, depth };
      }

      scope = scope.parent;
      depth += 1;
    }

    return null;
  }
}

export function createGlobalScope() {
  return new Scope({ parent: null, type: "global" });
}

export function createBlockScope(parent) {
  return new Scope({ parent, type: "block" });
}
