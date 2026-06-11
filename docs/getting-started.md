# Getting Started With BN Script

BN Script is an automation-first language that compiles to JavaScript. The v0.1 alpha supports declarations, assignments, printing, conditionals, while loops, range loops, for-each loops, break/continue loop control, functions, async/await, named imports, exports, runtime helper calls, try/catch/finally, arrays, objects, member/index access, blocks, primitive values, calls, basic expressions, Bangla-style keywords, and English keyword aliases.

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
node src/cli.js repl
```

The package also exposes the intended binary name:

```sh
bn check file.bn
bn build file.bn
bn run file.bn
bn repl
```

Use `npm link` only when you want to test that local binary behavior.

## Interactive REPL

Start an interactive BN Script session:

```sh
node src/cli.js repl
```

Example session:

```txt
BN Script REPL v0.1.0-alpha.0
Type .help for commands
Type .exit to quit

> dhori x = 10
> dhori y = 20
> dekhi x + y
30
> .exit
```

REPL variables persist for the lifetime of the session. Use `.help` inside the
REPL to list commands.

## VS Code Extension

The local VS Code extension package lives in `vscode/`. It provides `.bn` file
association, syntax highlighting, comment configuration, bracket handling, and
auto-closing pairs.

To test it during development:

```sh
code vscode
```

Then press `F5` in VS Code to launch an Extension Development Host and open a
`.bn` file there.

To build an installable VSIX package:

```sh
npm run build:vsix
```

The generated package is written to `dist/bnscript-0.1.0-alpha.0.vsix`.
Install it from VS Code with `Extensions -> ... -> Install from VSIX...`.

If VS Code does not automatically associate `.bn` files with BN Script, add this
to your user or workspace `settings.json`:

```json
{
  "files.associations": {
    "*.bn": "bnscript"
  }
}
```

This extension is not published to the VS Code Marketplace. Language server
features remain future work.

## Alpha Syntax

BN Script supports both Bangla-style keywords and English aliases. These compile
the same way:

```bn
dhori name = "Risat"
dekhi name
```

```bn
let name = "Risat"
print name
```

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
  jodi i == 2 {
    cholo
  }
  dekhi i
}

dhori names = ["Risat", "BN"]
dekhi names[0]

bar name ekti names {
  dekhi name
  bekkhon
}

dhori user = {
  name: "Risat",
  profile: {
    city: "Dhaka"
  }
}

dekhi user.profile.city

amdani { greet } theke "./module-utils.bn"

roptani kaj greetModule(name) {
  dekhi name
}

async kaj load() {
  dhori text = await fileRead("data.txt")
  ferot text
}

await wait(10)

dhoro {
  dekhi "try"
} error err {
  dekhi err
} sheshe {
  dekhi "done"
}

let englishName = "Risat"
if true and not false {
  print englishName
}
```

Supported today:

- `dhori`, `sthir`, and `dekhi`
- English aliases: `let`, `const`, and `print`
- `jodi` / `nahole`
- English aliases: `if` / `else`
- `jotokkhon` while loops
- English alias: `while`
- Range `bar` loops with `theke`
- For-each `bar` loops with `ekti`
- `bekkhon` and `cholo` inside loops
- English aliases: `break` and `continue`
- Assignment expressions, variable reassignment, and compound assignment
- Array literals and index access
- Object literals and member access
- Assignment to member and index targets
- `kaj` function declarations
- `ferot` return statements inside functions
- English aliases: `function` and `return`
- Function parameters and calls
- `async kaj` function declarations
- `await` expressions inside async functions and top-level programs
- Named imports with `amdani { name } theke "./file.bn"`
- Exported functions, variables, and constants with `roptani`
- English aliases: `import { name } from "./file.bn"` and `export`
- Runtime helpers: `env`, `fileRead`, `fileWrite`, `wait`, and `httpGet`
- Try/catch/finally with `dhoro`, `error`, and `sheshe`
- English aliases: `try`, `catch`, and `finally`
- Interactive REPL via `node src/cli.js repl`
- Local VS Code extension package for `.bn` syntax highlighting
- Blocks with `{` and `}`
- Numbers, strings, booleans, null, and identifiers
- Unary `na` and `-`
- Arithmetic, comparison, equality, and logical binary operators
- Grouped expressions with parentheses

## Current Limits

Simple repeat `bar 5 { ... }` loops, default imports, namespace imports, re-exports, full module graph analysis, AI helpers, package publishing, advanced editor tooling, and LSP support are planned but not implemented in this alpha.

Function support currently covers named `kaj` declarations, positional parameters, `ferot`, and direct calls. Default parameters, function expressions, arrow functions, and methods are not implemented yet.
