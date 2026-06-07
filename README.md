# BN Script

BN Script is an automation-first programming language that compiles to readable JavaScript. It is built for small scripts that automate files, APIs, AI workflows, environment tasks, and everyday developer operations.

BN Script is currently in `v0.1.0-alpha.0`. The compiler architecture is real and test-backed, while the implemented language surface is intentionally small.

## Why BN Script Exists

JavaScript is powerful, but routine automation can still feel noisy: reading files, calling APIs, checking environment variables, waiting between retries, and eventually using AI helpers all require repeated setup.

BN Script exists to make those workflows easier to write and easier to read while still compiling to JavaScript that Node.js can run.

BN Script is not trying to replace JavaScript or TypeScript. It is a focused scripting language for automation.

## Features

- Real compiler pipeline: lexer, parser, AST, semantic analyzer, JavaScript generator
- Readable JavaScript output for Node.js
- Bangla-transliterated keywords such as `dhori`, `sthir`, `dekhi`, `jodi`, and `nahole`
- Newline-oriented syntax with no required semicolons
- Strict equality output: BN Script `==` compiles to JavaScript `===`
- Function declarations with `kaj`, `ferot` returns, parameters, and calls
- Built-in runtime foundation for HTTP, file, environment, and wait helpers
- Structured compiler diagnostics with file and line information
- Zero runtime npm dependencies in the current alpha
- Native Node.js test suite

## Architecture

BN Script uses a staged compiler architecture:

```text
Source (.bn)
  -> Lexer
  -> Parser
  -> AST
  -> Semantic Analyzer
  -> JavaScript Generator
  -> JavaScript (.js)
```

Key source modules:

- `src/lexer.js` tokenizes BN Script source.
- `src/parser.js` builds the AST with recursive descent parsing.
- `src/analyzer.js` validates scope and semantic rules.
- `src/generator.js` emits JavaScript.
- `src/compiler.js` runs the full pipeline.
- `src/cli.js` provides `check`, `build`, and `run`.

## Installation

BN Script requires Node.js 18 or newer.

Clone the repository and install dependencies:

```sh
git clone <repo-url>
cd bnscript
npm install
```

This alpha has no external package dependencies, but `npm install` prepares the local package workflow.

Run the test suite:

```sh
npm test
```

On PowerShell systems that block `npm.ps1`, use:

```powershell
npm.cmd test
```

## Example

BN Script:

```bn
dhori name = "BN Script"
sthir version = 0.1

jodi version >= 0.1 {
  dekhi name
} nahole {
  dekhi "not ready"
}
```

Generated JavaScript:

```js
let name = "BN Script";
const version = 0.1;

if (version >= 0.1) {
  console.log(name);
} else {
  console.log("not ready");
}
```

More examples live in [`examples/`](examples/).

## CLI Usage

Use the local alpha CLI from the repository root:

```sh
node src/cli.js check examples/hello.bn
node src/cli.js build examples/hello.bn
node src/cli.js run examples/hello.bn
```

After package linking or installation, the intended command form is:

```sh
bn check file.bn
bn build file.bn
bn run file.bn
```

Commands:

| Command | Description |
| --- | --- |
| `check` | Parse and semantically validate a `.bn` file. |
| `build` | Compile a `.bn` file to a sibling `.js` file. |
| `run` | Compile a `.bn` file to a temporary ES module and execute it. |

## Supported In v0.1 Alpha

- `dhori` variable declarations
- `sthir` constant declarations
- `dekhi` print statements
- `jodi` and `nahole` conditionals
- `kaj` function declarations
- `ferot` return statements inside functions
- Function parameters
- Function calls
- Block statements
- Expression statements
- Identifiers
- Number, string, boolean, and null literals
- Booleans: `sotti`, `mittha`
- Null: `khali`
- Unary operators: `na`, `-`
- Binary operators: `+`, `-`, `*`, `/`, `%`, `**`, `==`, `!=`, `>`, `<`, `>=`, `<=`, `ebong`, `othoba`
- Grouped expressions with parentheses

## Current Limitations

The v0.1 alpha intentionally does not parse or generate loops, imports, exports, assignments, arrays, objects, member access, indexing, async/await syntax, AI helpers, package publishing flows, editor tooling, an LSP, or a REPL.

Function support is intentionally small: named `kaj` declarations, positional parameters, `ferot`, and direct calls are supported. Default parameters, function expressions, arrow functions, methods, recursion-specific checks, and higher-order function semantics are not implemented yet.

The design documents include planned language features that are not fully implemented yet. For the exact current behavior, prefer this README, [`docs/getting-started.md`](docs/getting-started.md), and the test suite.

## Roadmap

- `v0.1.x`: stabilize function support, current compiler subset, CLI behavior, docs, and examples
- `v0.2`: assignment parsing, loops, member access, arrays, and objects
- `v0.3`: imports, exports, and richer runtime integration
- `v0.4`: async/await syntax, file/API automation helpers, AI helper implementation
- `v0.5`: REPL, source maps, improved diagnostics, and editor tooling planning
- `v1.0`: stable language subset, public package workflow, and production documentation

## Contributing

Contributions are welcome during the alpha, especially focused compiler fixes, tests, examples, and documentation improvements.

Before opening a pull request:

1. Keep changes scoped to one compiler stage or documentation topic.
2. Add or update tests when behavior changes.
3. Run `npm test`.
4. Document any known limitation introduced by the change.

Good first areas include parser edge cases, diagnostic clarity, integration fixtures, and beginner-friendly examples.

## Documentation

- [Getting Started](docs/getting-started.md)
- [CLI Reference](docs/cli.md)
- [Language Specification](docs/language-spec.md)
- [Compiler Architecture](docs/compiler-architecture.md)
- [Runtime Design](docs/runtime-design.md)

## License

BN Script is released under the MIT License. See [LICENSE](LICENSE).
