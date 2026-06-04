# BN Script CLI

The BN Script CLI runs the compiler pipeline:

```text
Lexer -> Parser -> Semantic Analyzer -> JavaScript Generator
```

## Local Usage

From the repository root:

```sh
node src/cli.js <command> file.bn
```

The package exposes the intended installed command name:

```sh
bn <command> file.bn
```

## Commands

| Command | Description |
| --- | --- |
| `check` | Parse and semantically validate a BN Script file. |
| `build` | Compile a BN Script file and write a sibling `.js` file. |
| `run` | Compile a BN Script file to a temporary ES module and execute it. |

## Check

```sh
node src/cli.js check examples/hello.bn
```

On success, `check` prints a pass message. On failure, it prints compiler diagnostics and exits with code `1`.

## Build

```sh
node src/cli.js build examples/hello.bn
```

`build` writes generated JavaScript next to the input file. For example, `examples/hello.bn` produces `examples/hello.js`.

## Run

```sh
node src/cli.js run examples/hello.bn
```

`run` compiles to a temporary ES module and executes that module with Node.js.

## Exit Codes

| Exit Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Usage, file, parse, semantic, or general execution error |
| `2` | BN runtime error |

## Diagnostics

The CLI prints formatted diagnostics when compiler or runtime errors provide formatting metadata.

Current diagnostic categories:

- `ParseError`
- `SemanticError`
- `RuntimeError`

## Current Limits

The alpha CLI supports only `check`, `build`, and `run`. It does not yet include a REPL, editor integration, source maps, package publishing automation, or advanced flags.
