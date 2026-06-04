# BN Script v0.1.0 Alpha Release Notes

BN Script v0.1.0 alpha is the first public-ready local release preparation for the automation-first language that compiles to JavaScript.

This release is intended for early contributors, language-design review, and compiler architecture feedback.

## Highlights

- Real compiler pipeline implemented: lexer, parser, AST, semantic analyzer, JavaScript generator
- CLI commands available: `check`, `build`, and `run`
- Runtime helper foundation implemented for fetch, file, env, wait, and runtime errors
- Test-backed alpha subset with declarations, printing, conditionals, blocks, and expressions
- Public README, getting started guide, CLI reference, examples, and release metadata
- MIT License prepared for open-source distribution

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
- Add loops, function declarations, calls, arrays, and objects
- Expand runtime integration for file/API automation
- Implement AI helpers
- Add source maps, editor tooling, LSP planning, and REPL planning
- Prepare package publishing workflow after release review

## Known Limitations

- Loops are not parsed yet.
- Functions are not parsed yet.
- Imports and exports are not parsed yet.
- Assignment expressions are not parsed yet.
- Arrays, objects, calls, member access, and indexing are not parsed yet.
- Async/await syntax is not parsed yet.
- Runtime AI helpers are not implemented yet.
- Public package publishing has not been performed.
- This repository folder did not contain a `.git` directory during release preparation, so Git commands must be run from the real repository checkout before publishing.
