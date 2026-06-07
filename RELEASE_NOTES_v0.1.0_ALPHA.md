# BN Script v0.1.0 Alpha Release Notes

BN Script v0.1.0 alpha is the first public-ready local release preparation for the automation-first language that compiles to JavaScript.

This release is intended for early contributors, language-design review, and compiler architecture feedback.

## Highlights

- Real compiler pipeline implemented: lexer, parser, AST, semantic analyzer, JavaScript generator
- CLI commands available: `check`, `build`, and `run`
- Runtime helper foundation implemented for fetch, file, env, wait, and runtime errors
- Test-backed alpha subset with declarations, printing, conditionals, functions, calls, blocks, and expressions
- Public README, getting started guide, CLI reference, examples, and release metadata
- MIT License prepared for open-source distribution

## Update: Stage 7 Functions

Function support is now available in the alpha branch.

Supported:

- `kaj` function declarations
- `ferot` return statements
- Function parameters
- Function calls

Example:

```bn
kaj greet(name) {
  ferot "Hello " + name
}

dekhi greet("Risat")
```

This compiles to JavaScript function declarations and calls.

## Architecture

BN Script compiles through clear compiler stages:

```text
Lexer -> Parser -> AST -> Semantic Analyzer -> JavaScript Generator
```

The current architecture favors maintainability over shortcuts. It does not use string replacement as a compiler strategy.

## Examples

Current examples live in `examples/`:

- `hello.bn`
- `variables.bn`
- `if.bn`
- `logic.bn`
- `functions.bn`

Example:

```bn
dhori name = "BN Script"

jodi name == "BN Script" {
  dekhi "ready"
} nahole {
  dekhi "not ready"
}
```

## Roadmap

- Stabilize the alpha compiler subset
- Add assignment parsing and richer expressions
- Add loops, arrays, objects, member access, and indexing
- Expand runtime integration for file/API automation
- Implement AI helpers
- Add source maps, editor tooling, LSP planning, and REPL planning
- Prepare package publishing workflow after release review

## Known Limitations

- Loops are not parsed yet.
- Imports and exports are not parsed yet.
- Assignment expressions are not parsed yet.
- Arrays, objects, member access, and indexing are not parsed yet.
- Async/await syntax is not parsed yet.
- Default parameters, function expressions, arrow functions, and methods are not implemented yet.
- Runtime AI helpers are not implemented yet.
- Public package publishing has not been performed.
