# BN Script 🚀

> Write code in Bangla. Compile to JavaScript. Build with modern developer tools.

BN Script is an open-source programming language that combines Bangla-inspired syntax with the power of JavaScript.

It compiles directly to JavaScript and ships with a custom VS Code extension featuring syntax highlighting, autocomplete, hover documentation, diagnostics, and developer tooling.

Whether you're learning programming, exploring compiler design, or building developer tools, BN Script provides a familiar yet unique coding experience.

---

## Why BN Script?

Most programming languages are designed around English keywords.

BN Script explores a different idea:

```bn
dhori nam = "Risat"

jodi nam == "Risat" {
    dekhi "Welcome!"
}
```

while still supporting:

```bn
let name = "Risat"

if (name == "Risat") {
    print("Welcome!")
}
```

This means developers can use Bangla-inspired syntax, English syntax, or a mix of both.

---

# Features

## Language Features

### Variables

```bn
dhori nam = "Risat"
sthir version = "0.1.0"
```

or

```bn
let name = "Risat"
const version = "0.1.0"
```

### Functions

```bn
kaj greet(user) {
    dekhi user
}
```

### Conditions

```bn
jodi score >= 90 {
    dekhi "Excellent"
} nahole {
    dekhi "Keep Learning"
}
```

### Loops

```bn
bar member ekti team {
    dekhi member
}
```

### Arrays & Objects

```bn
dhori developers = [
    { nam: "Risat", score: 95 },
    { nam: "Rahim", score: 88 }
]
```

### Async / Await

```bn
await wait(1000)

dekhi "Done"
```

### Modules

```bn
amdani { greet } theke "./utils"

roptani kaj hello() {
    dekhi "Hello"
}
```

### Error Handling

```bn
dhoro {
    dekhi "Trying..."
} error err {
    dekhi err
} sheshe {
    dekhi "Done"
}
```

---

# VS Code Extension

BN Script includes a dedicated VS Code extension.

## Supported Features

✅ Syntax Highlighting

✅ Autocomplete

✅ Hover Documentation

✅ Bilingual Diagnostics

✅ Problems Panel Integration

✅ Check / Build / Run Commands

✅ VSIX Packaging

---

## Syntax Highlighting

BN Script keywords are highlighted automatically.

Supported categories:

* Keywords
* Strings
* Numbers
* Functions
* Imports / Exports
* Runtime Helpers
* Operators
* Comments

---

## Autocomplete

Suggestions appear while typing:

```bn
dho...
```

Suggestions:

```txt
dhori
dhoro
```

or

```bn
asy...
```

Suggestions:

```txt
async
await
```

---

## Hover Documentation

Hover over:

```bn
dhori
kaj
await
amdani
roptani
```

to view language documentation directly inside VS Code.

---

## Diagnostics

BN Script provides bilingual diagnostics.

Example:

### Bangla

```txt
Variable "user" age declare kora hoyni.
```

### English

```txt
Variable "user" is not declared.
```

### Hint

```txt
Prothome variable declare korun.
```

Diagnostics appear as:

* Red Squiggles
* Problems Panel Entries
* Click-to-Navigate Errors

---

# How Compilation Works

BN Script source:

```bn
dekhi "Hello BN Script"
```

Generated JavaScript:

```js
console.log("Hello BN Script");
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/sayedrisat/bnscript.git
cd bnscript
npm install
```

---

# CLI Usage

## Check

Validate syntax and semantics:

```bash
node src/cli.js check examples/hello.bn
```

---

## Build

Generate JavaScript output:

```bash
node src/cli.js build examples/hello.bn
```

---

## Run

Execute BN Script:

```bash
node src/cli.js run examples/hello.bn
```

or

```bash
node src/cli.js examples/hello.bn
```

---

## REPL

Interactive shell:

```bash
node src/cli.js repl
```

---

# VS Code Extension Installation

Build VSIX:

```bash
npm run build:vsix
```

Generated file:

```txt
dist/bnscript-0.1.0-alpha.0.vsix
```

Install:

1. Open VS Code
2. Extensions (`Ctrl + Shift + X`)
3. Click `...`
4. Install from VSIX
5. Select generated file
6. Reload VS Code

---

# Advantages

* Bangla-inspired syntax
* Familiar English aliases
* Compiles to JavaScript
* Modern async support
* Module system
* REPL
* VS Code integration
* Open Source
* Beginner friendly
* Compiler design learning resource

---

# Current Limitations

* Alpha release
* No LSP yet
* No code actions yet
* No semantic highlighting yet
* No workspace symbol navigation
* Marketplace publication pending
* Ecosystem still growing

---

# Testing

Current Status:

```txt
298 / 298 Tests Passing
```

Test Suite Covers:

* Lexer
* Parser
* Semantic Analyzer
* Generator
* Runtime Helpers
* CLI
* REPL
* VS Code Extension
* Diagnostics
* Integration Tests

Run tests:

```bash
npm test
```

---

# Roadmap

### Completed

* Compiler Pipeline
* Modules
* Async / Await
* Top-Level Await
* Runtime Helpers
* REPL
* VS Code Extension
* Diagnostics
* Autocomplete
* Hover Documentation

### Next

* Global CLI (`bn`)
* Marketplace Publishing
* Incremental Diagnostics
* Code Actions
* LSP
* Symbol Navigation

---

# Contributing

Contributions are welcome.

Please check:

* Issues
* Discussions
* CONTRIBUTING.md

---

# License

MIT License

---

Built with ❤️ by Sayed Risat
