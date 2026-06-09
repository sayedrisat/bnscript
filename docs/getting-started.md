# Getting Started With BN Script

BN Script is an automation-first language that compiles to JavaScript. The v0.1 alpha supports declarations, assignments, printing, conditionals, while loops, range loops, for-each loops, functions, arrays, objects, member/index access, blocks, primitive values, calls, and basic expressions.

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

kaj greet(person) {
  ferot "Hello " + person
}

dekhi greet("Risat")

dhori count = 0
jotokkhon count < 3 {
  dekhi count
  count += 1
}

bar i = 0 theke 3 {
  dekhi i
}

dhori names = ["Risat", "BN"]
dekhi names[0]

bar name ekti names {
  dekhi name
}

dhori user = {
  name: "Risat",
  profile: {
    city: "Dhaka"
  }
}

dekhi user.profile.city
```

Supported today:

- `dhori`, `sthir`, and `dekhi`
- `jodi` / `nahole`
- `jotokkhon` while loops
- Range `bar` loops with `theke`
- For-each `bar` loops with `ekti`
- Assignment expressions, variable reassignment, and compound assignment
- Array literals and index access
- Object literals and member access
- Assignment to member and index targets
- `kaj` function declarations
- `ferot` return statements inside functions
- Function parameters and calls
- Blocks with `{` and `}`
- Numbers, strings, booleans, null, and identifiers
- Unary `na` and `-`
- Arithmetic, comparison, equality, and logical binary operators
- Grouped expressions with parentheses

## Current Limits

Simple repeat `bar 5 { ... }` loops, modules, async/await syntax, AI helpers, package publishing, editor tooling, LSP, and REPL support are planned but not implemented in this alpha.

Function support currently covers named `kaj` declarations, positional parameters, `ferot`, and direct calls. Default parameters, function expressions, arrow functions, and methods are not implemented yet.
