# 🚀 BN Script

**An automation-first programming language that compiles to JavaScript.**

BN Script is a programming language designed to make automation scripts easier to write, read, and maintain while still generating clean JavaScript that runs on Node.js.

It combines a real compiler architecture with a beginner-friendly syntax inspired by Bangla-transliterated keywords.

---

## ✨ Current Status

**Version:** `v0.1.0-alpha.0`

### Implemented

✅ Lexer
✅ Parser
✅ Abstract Syntax Tree (AST)
✅ Semantic Analyzer
✅ JavaScript Generator
✅ Runtime System
✅ CLI Tool
✅ Assignment Expressions
✅ While Loops
✅ Function Support
✅ 125+ Automated Tests

---

## 🔥 Why BN Script?

Modern automation often requires repetitive JavaScript boilerplate for:

* File operations
* API requests
* Environment variables
* Task automation
* Future AI workflows

BN Script aims to make these workflows simpler while still compiling into readable JavaScript.

Instead of replacing JavaScript, BN Script sits on top of it.

Write BN Script.

Compile to JavaScript.

Run anywhere Node.js runs.

---

## 🏗 Architecture

BN Script follows a real compiler pipeline:

```text
BN Script Source
        ↓
      Lexer
        ↓
      Parser
        ↓
 Semantic Analyzer
        ↓
 JavaScript Generator
        ↓
      Runtime
        ↓
        CLI
```

Unlike simple text replacement tools, BN Script performs proper parsing, semantic analysis, and code generation.

---

## 🚀 Quick Example

### BN Script

```bn
kaj greet(name) {
  ferot "Hello " + name
}

dekhi greet("Risat")
```

### Generated JavaScript

```js
function greet(name) {
  return "Hello " + name;
}

console.log(greet("Risat"));
```

### Output

```txt
Hello Risat
```

---

## ✨ Features

### Variables

```bn
dhori name = "Risat"
```

### Constants

```bn
sthir version = 0.1
```

### Output

```bn
dekhi "Hello World"
```

### Conditionals

```bn
jodi score >= 90 {
  dekhi "Excellent"
} nahole {
  dekhi "Keep Going"
}
```

### Assignment

```bn
dhori count = 0
count = count + 1
count += 4
```

### While Loops

```bn
dhori i = 0

jotokkhon i < 3 {
  dekhi i
  i = i + 1
}
```

### Functions

```bn
kaj greet(name) {
  ferot "Hello " + name
}

dekhi greet("Risat")
```

### Literals

```bn
sotti
mittha
khali
```

### Operators

```bn
+
-
*
/
%
**
==
!=
>
<
>=
<=
ebong
othoba
na
```

---

## 📦 Installation

Requirements:

* Node.js 18+

Clone the repository:

```bash
git clone https://github.com/sayedrisat/bnscript.git
cd bnscript
npm install
```

Run tests:

```bash
npm test
```

Windows PowerShell:

```powershell
npm.cmd test
```

---

## 🖥 CLI Usage

Check a BN Script file:

```bash
node src/cli.js check examples/hello.bn
```

Build JavaScript:

```bash
node src/cli.js build examples/hello.bn
```

Run directly:

```bash
node src/cli.js run examples/hello.bn
```

Future installed usage:

```bash
bn check file.bn
bn build file.bn
bn run file.bn
```

---

## 📚 Supported In Alpha

- `dhori` variable declarations
- `sthir` constant declarations
- `dekhi` print statements
- `jodi` and `nahole` conditionals
- `jotokkhon` while loops
- Assignment expressions
- Variable reassignment
- Compound assignment: `+=`, `-=`, `*=`, `/=`
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

---

## ⚠ Current Limitations

Not implemented yet:

* Counted `bar` Loops
* For-Each Loops
* Arrays
* Objects
* Imports / Exports
* Member Access
* Indexing
* Async / Await
* AI Runtime Helpers
* Package Manager
* REPL
* LSP
* VS Code Extension

This project is currently in Alpha and focused on compiler stability.

---

## 🗺 Roadmap

### v0.2

* Counted Loops
* For-Each Loops
* Member Access

### v0.3

* Arrays
* Objects

### v0.4

* Imports / Exports
* Modules

### v0.5

* Async / Await
* File/API Automation Helpers

### Future

* AI Runtime Helpers
* REPL
* Language Server Protocol (LSP)
* VS Code Extension
* Package Ecosystem

---

## 🧪 Testing

Current test coverage includes:

* Lexer Tests
* Parser Tests
* Semantic Analyzer Tests
* Generator Tests
* Runtime Tests
* CLI Tests
* Integration Tests

**125+ tests passing**

---

## 🤝 Contributing

Contributions are welcome.

Good first contributions:

* Compiler improvements
* Parser edge cases
* Better diagnostics
* Documentation
* Examples
* Tests

Before submitting a PR:

1. Run tests
2. Add/update tests
3. Keep changes focused
4. Document limitations

---

## 📖 Documentation

* Getting Started
* CLI Reference
* Language Specification
* Compiler Architecture
* Runtime Design

See the `docs/` directory.

---

## ⭐ Support The Project

If you find BN Script interesting:

* Star the repository
* Report bugs
* Open feature requests
* Share the project

Repository:

https://github.com/sayedrisat/bnscript

---

## 📄 License

Released under the MIT License.

See `LICENSE` for details.
