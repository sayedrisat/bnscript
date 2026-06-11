# BN Script

> A Bangla-inspired programming language that compiles to JavaScript.

BN Script is an open-source programming language designed to make programming more accessible through Bangla-inspired syntax while still supporting familiar English alternatives.

It compiles directly to JavaScript and includes a custom VS Code extension with syntax highlighting, autocomplete, hover documentation, diagnostics, and developer tooling.

---

## Features

### Language Features

* Variables (`dhori`, `sthir`, `let`, `const`)
* Functions (`kaj`, `function`)
* Conditional Statements (`jodi`, `nahole`, `if`, `else`)
* Loops
* Arrays
* Objects
* Recursion
* Async / Await
* Top-Level Await
* Modules (`amdani`, `roptani`)
* Try / Catch / Finally
* Runtime Helpers

### Developer Experience

* Interactive REPL
* Bilingual Diagnostics (Bangla + English)
* VS Code Extension
* Syntax Highlighting
* Autocomplete
* Hover Documentation
* Problems Panel Integration
* Run / Build / Check Commands
* VSIX Packaging Support

---

## Example

```bn
async kaj talentAudit(team) {
    dhori motScore = 0

    bar member ekti team {
        motScore += member.score
    }

    dhori average = motScore / team.length

    jodi average >= 90 {
        dekhi "Elite Engineering Team"
    } nahole {
        dekhi "Growing Team"
    }
}

dhori developers = [
    { nam: "Risat", score: 95 },
    { nam: "Rahim", score: 88 },
    { nam: "Karim", score: 91 }
]

await talentAudit(developers)
```

Generated JavaScript:

```js
async function talentAudit(team) {
    let motScore = 0;

    for (const member of team) {
        motScore += member.score;
    }

    const average = motScore / team.length;

    if (average >= 90) {
        console.log("Elite Engineering Team");
    } else {
        console.log("Growing Team");
    }
}
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/sayedrisat/bnscript.git
cd bnscript
npm install
```

---

## Usage

### Check

```bash
node src/cli.js check examples/hello.bn
```

### Build

```bash
node src/cli.js build examples/hello.bn
```

### Run

```bash
node src/cli.js run examples/hello.bn
```

### Shorthand Run

```bash
node src/cli.js examples/hello.bn
```

### REPL

```bash
node src/cli.js repl
```

---

## VS Code Extension

BN Script includes a VS Code extension with:

* Syntax Highlighting
* Autocomplete
* Hover Documentation
* Diagnostics
* Problems Panel Integration
* Run / Build / Check Commands

### Install

```bash
npm run build:vsix
```

Then:

Extensions → Install from VSIX

Select:

```txt
dist/bnscript-0.1.0-alpha.0.vsix
```

---

## Diagnostics Example

Bangla:

```txt
Variable "user" age declare kora hoyni.
```

English:

```txt
Variable "user" is not declared.
```

Hint:

```txt
Prothome variable declare korun.
```

---

## Project Status

Current Version:

```txt
v0.1.0-alpha.0
```

Current Test Status:

```txt
298 / 298 Tests Passing
```

---

## Roadmap

### Completed

* Compiler Pipeline
* Semantic Analysis
* Async / Await
* Top-Level Await
* Modules
* Runtime Helpers
* REPL
* VS Code Extension
* Diagnostics
* Autocomplete
* Hover Documentation

### Planned

* Global CLI (`bn`)
* Marketplace Publishing
* Incremental Diagnostics
* Code Actions
* LSP Support
* Workspace Symbol Navigation

---

## Contributing

Contributions, bug reports, feature requests, and discussions are welcome.

Please check:

* CONTRIBUTING.md
* Issues
* Discussions

---

## License

MIT License

---

Built by Sayed Risat ❤️
