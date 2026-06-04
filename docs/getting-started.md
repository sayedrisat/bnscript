# Getting Started With BN Script

BN Script is an automation-first language that compiles to JavaScript. The v0.1 alpha supports declarations, printing, conditionals, blocks, primitive values, and basic expressions.

## Requirements

- Node.js 18 or newer
- A local checkout of this repository

## Install

From the project root:

```sh
npm install
```

The alpha currently has no external runtime dependencies.

## Run Tests

```sh
npm test
```

On PowerShell systems that block `npm.ps1`, use:

```powershell
npm.cmd test
```

## First Program

Create `hello.bn`:

```bn
dekhi "Hello, BN Script!"
```

Check it:

```sh
node src/cli.js check hello.bn
```

Build it:

```sh
node src/cli.js build hello.bn
```

Run it:

```sh
node src/cli.js run hello.bn
```

## Local CLI

During this alpha, the supported repository workflow is:

```sh
node src/cli.js <check|build|run> file.bn
```

The package also exposes the intended binary name:

```sh
bn check file.bn
bn build file.bn
bn run file.bn
```

Use `npm link` only when you want to test that local binary behavior.

## Alpha Syntax

```bn
dhori name = "BN Script"
sthir version = 0.1

jodi version >= 0.1 {
  dekhi name
} nahole {
  dekhi "not ready"
}
```

Supported today:

- `dhori`, `sthir`, and `dekhi`
- `jodi` / `nahole`
- Blocks with `{` and `}`
- Numbers, strings, booleans, null, and identifiers
- Unary `na` and `-`
- Arithmetic, comparison, equality, and logical binary operators
- Grouped expressions with parentheses

## Current Limits

Loops, functions, modules, assignments, arrays, objects, calls, member access, async/await syntax, AI helpers, package publishing, editor tooling, LSP, and REPL support are planned but not implemented in this alpha.
