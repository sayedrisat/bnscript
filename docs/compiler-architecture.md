# BN Script Compiler Architecture v0.1

> Public alpha note: this architecture describes the full intended compiler
> shape. The v0.1.0 alpha implements the core pipeline and a deliberately small
> language subset. Some sections describe future parser, generator, and runtime
> behavior that is not available yet.

> **Status:** Draft — Architecture Design Phase
> **Implementation Language:** JavaScript (Node.js)
> **Input:** `.bn` source files
> **Output:** `.js` JavaScript files (ES Module format)

---

## 1. Architecture Overview

The BN Script compiler is a **multi-stage, single-pass-per-stage** pipeline. Each stage is a distinct, testable module with clear input/output contracts. There is no optimization pass in v0.1 — the focus is correctness and readable output.

```
┌──────────┐     ┌────────┐     ┌──────┐     ┌───────────┐     ┌───────────┐
│  Source   │────▶│ Lexer  │────▶│Parser│────▶│ Semantic  │────▶│ Generator │
│  (.bn)   │     │        │     │      │     │ Analyzer  │     │   (JS)    │
└──────────┘     └────────┘     └──────┘     └───────────┘     └───────────┘
     │              │              │              │                   │
     │           Tokens          AST         Annotated AST       JS Source
     │                                                               │
     │                                                          ┌────▼────┐
     │                                                          │ Output  │
     │                                                          │ (.js)   │
     └──────────────────────────────────────────────────────────└─────────┘
```

### Pipeline Summary

| Stage              | Input           | Output            | Module File           |
|--------------------|-----------------|-------------------|-----------------------|
| 1. Lexer           | Source string   | Token array       | `src/lexer.js`        |
| 2. Parser          | Token array    | AST               | `src/parser.js`       |
| 3. Semantic Analysis| AST           | Annotated AST     | `src/analyzer.js`     |
| 4. Code Generator  | Annotated AST  | JavaScript string | `src/generator.js`    |

Supporting modules:

| Module             | Purpose                        | File                  |
|--------------------|--------------------------------|-----------------------|
| Token Types        | Token type enum/constants      | `src/tokens.js`       |
| AST Node Types     | AST node type definitions      | `src/ast.js`          |
| Error Reporter     | Structured error reporting     | `src/errors.js`       |
| CLI Entry Point    | Command-line interface         | `src/cli.js`          |
| Source Map (future)| Map JS output → BN Script source | `src/sourcemap.js` |

---

## 2. Stage 1: Lexer (Tokenizer)

### 2.1 Responsibility

The Lexer converts raw BN Script source text into a flat array of tokens. It handles:
- Keyword recognition
- Identifier extraction
- Number literal parsing (including `_` separators)
- String literal parsing (single and double quotes, with `${}` interpolation tracking)
- Operator and punctuation recognition
- Comment stripping (single-line `//` and multi-line `/* */`)
- Whitespace handling (significant for line counting, not for syntax)
- Line and column tracking for error reporting

### 2.2 Token Structure

Each token is a plain object with this shape:

```javascript
{
    type: "KEYWORD",        // Token type (see full list below)
    value: "dhori",         // The raw string value
    line: 1,                // 1-indexed line number
    column: 1,              // 1-indexed column number
    start: 0,               // Absolute character offset (start)
    end: 5                  // Absolute character offset (end, exclusive)
}
```

### 2.3 Token Types

```
// Literals
NUMBER          // 42, 3.14, 1_000
STRING          // "hello", 'world', strings with ${} 

// Identifiers
IDENTIFIER      // variable names, function names

// Keywords (one type per keyword for fast parser matching)
DHORI           // dhori
STHIR           // sthir
DEKHI           // dekhi
JODI            // jodi
NAHOLE          // nahole
BAR             // bar
JOTOKKHON       // jotokkhon
KAJ             // kaj
FEROT           // ferot
SOTTI           // sotti
MITTHA          // mittha
KHALI           // khali
NAO             // nao
THEKE           // theke
DAO             // dao
BEKKHON         // bekkhon
CHOLO           // cholo
DHORO           // dhoro
ERROR           // error
SHESHE          // sheshe
ABR             // abr
ASYNC           // async
EBONG           // ebong
OTHOBA          // othoba
NA              // na
EKTI            // ekti

// Operators
PLUS            // +
MINUS           // -
STAR            // *
SLASH           // /
PERCENT         // %
STAR_STAR       // **
EQUAL           // =
EQUAL_EQUAL     // ==
BANG_EQUAL      // !=
GREATER         // >
LESS            // <
GREATER_EQUAL   // >=
LESS_EQUAL      // <=
PLUS_EQUAL      // +=
MINUS_EQUAL     // -=
STAR_EQUAL      // *=
SLASH_EQUAL     // /=

// Punctuation
LEFT_PAREN      // (
RIGHT_PAREN     // )
LEFT_BRACE      // {
RIGHT_BRACE     // }
LEFT_BRACKET    // [
RIGHT_BRACKET   // ]
COMMA           // ,
DOT             // .
COLON           // :
SEMICOLON       // ; (optional, for future use)

// Special
EOF             // End of file marker
NEWLINE         // Newline (used for statement termination heuristics)
```

### 2.4 Lexer Algorithm

```
1. Initialize position = 0, line = 1, column = 1
2. While position < source.length:
   a. Skip whitespace (spaces, tabs) — update column
   b. If newline: emit NEWLINE token, increment line, reset column
   c. If "//": skip to end of line
   d. If "/*": skip to "*/" (handle nesting? — No, keep simple)
   e. If digit: read full number (including _ separators, decimal point)
   f. If quote (" or '): read string literal (emit single STRING token, parser handles ${} interpolation)
   g. If letter or _: read identifier, check keyword table (note: automation primitives like `anro`, `faile` are identifiers, not keywords)
   h. If operator char: read operator (handle multi-char: ==, !=, >=, <=, **, +=, etc.)
   i. If punctuation: emit single-char token
   j. Else: emit error with line/column
3. Emit EOF token
```

### 2.5 Error Recovery

The Lexer does NOT attempt error recovery. On encountering an invalid character, it:
1. Reports the error with file, line, column
2. Includes the problematic character in the error message
3. Stops lexing (fail-fast)

This is a deliberate v0.1 design choice. Error recovery in the lexer adds complexity with minimal benefit for an automation scripting language.

---

## 3. Stage 2: Parser

### 3.1 Responsibility

The Parser consumes the token array and produces an Abstract Syntax Tree (AST). It implements a **recursive descent parser** — chosen for:
- Easy to understand and modify
- Easy to produce clear error messages
- Sufficient performance for scripting language files (typically < 10K lines)
- Each grammar rule maps to exactly one function

### 3.2 Parser Strategy

- **Type:** Recursive Descent (top-down)
- **Lookahead:** LL(1) for most of the grammar, but **LL(2)** lookahead is required for `bar` statements to disambiguate the loop forms (`bar i =` vs `bar item ekti`).
- **Statement Termination:** Newline-based (like Go), with `{` blocks for compound statements
- **Expression Parsing:** Pratt parser / precedence climbing for operator expressions

### 3.3 Statement Termination Rules

BN Script does NOT use semicolons. Statements are terminated by:
1. A newline character (most common)
2. End of file
3. A closing brace `}`

The parser inserts implicit statement boundaries at newlines, **except** when:
1. The current line ends with an operator (`+`, `-`, `*`, `/`, `==`, etc.), opening brace `{`, comma `,`, or opening parenthesis/bracket `(`, `[`.
2. The next line starts with a dot `.` (method chaining).
3. The next non-newline token is `nahole`, `error`, or `sheshe` following a closing brace `}`.

Leading operators on a new line (e.g. `\n + 3`) start a new statement.

This allows multi-line expressions:
```
dhori result = longFunction(
    arg1,
    arg2,
    arg3
)
```

### 3.4 Core Parser Functions

Each function corresponds to a grammar rule from the language spec:

```
parseProgram()          → Program node
parseStatement()        → dispatches to specific statement parser
parseVarDeclaration()   → VarDeclaration node
parseConstDeclaration() → ConstDeclaration node
parseExpressionStatement() → ExpressionStatement node (handles assignments)
parsePrintStatement()   → PrintStatement node
parseIfStatement()      → IfStatement node
parseWhileStatement()   → WhileStatement node
parseForLoop()          → ForLoop node
parseForEachLoop()      → ForEachLoop node
parseFunctionDecl()     → FunctionDeclaration node
parseReturnStatement()  → ReturnStatement node
parseTryCatch()         → TryCatch node
parseImportStatement()  → ImportStatement node
parseExportStatement()  → ExportStatement node
parseBlock()            → Block node

// Expression parsing (precedence climbing)
parseExpression()       → entry point, lowest precedence
parseAssignExpr()       → assignment expressions
parseLogicalOr()        → othoba
parseLogicalAnd()       → ebong
parseEquality()         → ==, !=
parseComparison()       → >, <, >=, <=
parseAddition()         → +, -
parseMultiplication()   → *, /, %
parseExponent()         → ** (right-associative)
parseUnary()            → na, - (prefix)
parsePostfix()          → calls, member access, index access
parsePrimary()          → literals, identifiers, grouping, arrays, objects

### 3.4.1 Ambiguity Resolution Rules

1. **Object Literal vs Block Statement:** A `{` at the start of a statement is parsed as a Block. A `{` appearing as a sub-expression is parsed as an Object Literal.
2. **dekhi Arguments:** The `dekhi` statement consumes comma-separated expressions until it encounters a `NEWLINE`, `}`, or `EOF`.
```

### 3.5 Error Reporting

The parser produces errors in this format:

```
BN Script Error [Parse Error]

  File: app.bn
  Line: 12
  Column: 5

  Expected "}" to close block started at line 8.

  Suggestion:
    Add a closing "}" after line 11.
```

The parser tracks block-opening positions so it can reference them in "unclosed block" errors.

### 3.6 Error Recovery Strategy

The parser uses **synchronization** for error recovery:
1. On error, record the error
2. Advance tokens until a known synchronization point (next statement keyword: `dhori`, `sthir`, `jodi`, `kaj`, `bar`, `dekhi`, etc.)
3. Resume parsing
4. Report all collected errors at the end

This allows the compiler to report multiple errors in a single run instead of stopping at the first one.

---

## 4. Stage 3: AST (Abstract Syntax Tree)

### 4.1 Design Principles

- Every AST node carries source location info (`line`, `column`, `start`, `end`)
- Nodes are plain JavaScript objects (no classes in v0.1, for simplicity)
- Each node has a `type` field that uniquely identifies its kind
- The AST is a faithful representation of the source — no desugaring at this stage

### 4.2 Node Type Catalog

#### Program Node (Root)
```javascript
{
    type: "Program",
    body: [Statement],          // Array of top-level statements
    sourceFile: "app.bn"        // Source filename for error context
}
```

#### Expression Statement
```javascript
{
    type: "ExpressionStatement",
    expression: Expression,
    line: 1, column: 1
}
```

#### Variable & Constant Declarations
```javascript
// dhori x = 10
{
    type: "VarDeclaration",
    name: "x",                  // Identifier string
    initializer: Expression,    // The expression after =
    line: 1, column: 1
}

// sthir PI = 3.14
{
    type: "ConstDeclaration",
    name: "PI",
    initializer: Expression,
    line: 1, column: 1
}
```

#### Assignment
```javascript
// x = 20  or  x += 5
{
    type: "Assignment",
    target: Expression,         // Left-hand side (identifier or member expression)
    operator: "=",              // "=", "+=", "-=", "*=", "/="
    value: Expression,          // Right-hand side
    line: 1, column: 1
}
```

#### Print Statement
```javascript
// dekhi x, y, z
{
    type: "PrintStatement",
    arguments: [Expression],    // One or more expressions
    line: 1, column: 1
}
```

#### If Statement
```javascript
// jodi condition { } nahole jodi condition2 { } nahole { }
{
    type: "IfStatement",
    condition: Expression,
    consequent: Block,
    alternates: [               // Array of else-if branches
        {
            condition: Expression,
            consequent: Block
        }
    ],
    elseBlock: Block | null,    // Final else block, if any
    line: 1, column: 1
}
```

#### While Statement
```javascript
// jotokkhon condition { }
{
    type: "WhileStatement",
    condition: Expression,
    body: Block,
    line: 1, column: 1
}
```

#### For Loop (Counted)
```javascript
// bar 5 { }
{
    type: "ForLoop",
    variant: "count",           // Simple repeat N times
    count: Expression,          // The number expression
    body: Block,
    line: 1, column: 1
}

// bar i = 0 theke 10 { }
{
    type: "ForLoop",
    variant: "range",
    iterator: "i",              // Iterator variable name
    start: Expression,          // Start value
    end: Expression,            // End value (exclusive)
    body: Block,
    line: 1, column: 1
}
```

#### For-Each Loop
```javascript
// bar item ekti items { }
{
    type: "ForEachLoop",
    iterator: "item",           // Iterator variable name
    iterable: Expression,       // The collection to iterate
    body: Block,
    line: 1, column: 1
}
```

#### Function Declaration
```javascript
// kaj greet(name, prefix = "Hello") { }
{
    type: "FunctionDeclaration",
    name: "greet",
    params: [
        { name: "name", defaultValue: null },
        { name: "prefix", defaultValue: { type: "StringLiteral", value: "Hello" } }
    ],
    body: Block,
    isAsync: false,
    isExported: false,
    line: 1, column: 1
}
```

#### Return Statement
```javascript
// ferot expression
{
    type: "ReturnStatement",
    value: Expression | null,   // null for bare "ferot"
    line: 1, column: 1
}
```

#### Break and Continue
```javascript
{ type: "BreakStatement", line: 1, column: 1 }
{ type: "ContinueStatement", line: 1, column: 1 }
```

#### Try/Catch/Finally
```javascript
// dhoro { } error e { } sheshe { }
{
    type: "TryCatch",
    tryBlock: Block,
    errorVar: "e",              // Name of the error variable (or null)
    catchBlock: Block,
    finallyBlock: Block | null,
    line: 1, column: 1
}
```

#### Import Statement
```javascript
// nao { greet, farewell } theke "./utils.bn"
{
    type: "ImportStatement",
    specifiers: ["greet", "farewell"],  // Named imports
    defaultImport: null,                 // For: nao helpers theke "..."
    source: "./utils.bn",
    line: 1, column: 1
}

// nao helpers theke "./helpers.bn"
{
    type: "ImportStatement",
    specifiers: [],
    defaultImport: "helpers",
    source: "./helpers.bn",
    line: 1, column: 1
}
```

#### Export Statement
```javascript
// dao kaj greet(name) { }
{
    type: "ExportStatement",
    declaration: FunctionDeclaration | VarDeclaration | ConstDeclaration,
    line: 1, column: 1
}
```

#### Expression Nodes

```javascript
// Number literal
{ type: "NumberLiteral", value: 42, line: 1, column: 1 }

// String literal
{ type: "StringLiteral", value: "hello", hasInterpolation: false, line: 1, column: 1 }

// Template string (with interpolation)
{
    type: "TemplateLiteral",
    parts: [
        { type: "TemplateString", value: "Hello, " },
        { type: "TemplateExpression", expression: Expression },
        { type: "TemplateString", value: "!" }
    ],
    line: 1, column: 1
}

// Boolean literal
{ type: "BooleanLiteral", value: true, line: 1, column: 1 }

// Null literal
{ type: "NullLiteral", line: 1, column: 1 }

// Identifier
{ type: "Identifier", name: "x", line: 1, column: 1 }

// Binary expression
{
    type: "BinaryExpression",
    operator: "+",              // +, -, *, /, %, **, ==, !=, >, <, >=, <=
    left: Expression,
    right: Expression,
    line: 1, column: 1
}

// Logical expression
{
    type: "LogicalExpression",
    operator: "ebong",          // "ebong" or "othoba"
    left: Expression,
    right: Expression,
    line: 1, column: 1
}

// Unary expression
{
    type: "UnaryExpression",
    operator: "na",             // "na" or "-"
    operand: Expression,
    line: 1, column: 1
}

// Call expression
{
    type: "CallExpression",
    callee: Expression,         // The function being called
    arguments: [Expression],    // Argument list
    line: 1, column: 1
}

// Member access (dot notation)
{
    type: "MemberExpression",
    object: Expression,
    property: "name",           // The property name string
    computed: false,            // false = dot notation, true = bracket notation
    line: 1, column: 1
}

// Index access (bracket notation)
{
    type: "MemberExpression",
    object: Expression,
    property: Expression,       // The index expression
    computed: true,
    line: 1, column: 1
}

// Array literal
{
    type: "ArrayLiteral",
    elements: [Expression],
    line: 1, column: 1
}

// Object literal
{
    type: "ObjectLiteral",
    properties: [
        { key: "name", value: Expression }
    ],
    line: 1, column: 1
}

// Await expression
{
    type: "AwaitExpression",
    argument: Expression,       // The expression being awaited
    line: 1, column: 1
}
```

#### Block Node
```javascript
{
    type: "Block",
    body: [Statement],
    line: 1, column: 1
}
```

---

## 5. Stage 4: Semantic Analyzer

### 5.1 Responsibility

The semantic analyzer walks the AST and performs validation that the parser cannot do with syntax alone. It does NOT change the tree structure (no node additions or removals) — it annotates existing nodes with metadata and reports errors.

### 5.2 Checks Performed

#### 5.2.1 Scope Analysis
- Track variable declarations in nested scopes (function, block)
- Report "undeclared variable" errors
- Report "variable already declared in this scope" errors
- Track whether a variable is mutable (`dhori`) or immutable (`sthir`)
- Report "cannot reassign constant" errors

#### 5.2.2 Function Validation
- Ensure `ferot` only appears inside functions. If `ferot` is used at the top level, it produces a `SemanticError`.
- Ensure `bekkhon` and `cholo` only appear inside loops
- Track function parameter names for duplicate detection
- Validate default parameter order (defaults must come after non-defaults)

#### 5.2.3 Async Validation
- Ensure `abr` is only used inside `async` functions OR at the top level
- Flag `abr` inside non-async functions as an error

#### 5.2.4 Import/Export Validation
- Ensure imports reference valid file paths (existence check is optional in v0.1)
- Ensure exports only appear at the top level
- Track exported names for duplicate detection

#### 5.2.5 Built-in Validation
- Validate `anro`, `faile`, `ai`, `env`, `wait` call signatures
- Report incorrect argument counts for built-in functions
- Warn on potentially incorrect usage patterns

### 5.3 Scope Implementation

The analyzer maintains a **scope chain** (stack of scope objects):

```javascript
class Scope {
    constructor(parent) {
        this.parent = parent;           // Enclosing scope (null for global)
        this.variables = new Map();     // name → { mutable: bool, line: int, used: bool }
    }

    declare(name, mutable, line) { ... }
    resolve(name) { ... }              // Walk up scope chain
    isInLoop() { ... }                 // Check if any ancestor is a loop scope
    isInFunction() { ... }             // Check if any ancestor is a function scope
}
```

Scope entry/exit points:
- **Function declaration** → new scope (with parameters pre-declared)
- **Block `{}`** → new scope
- **For loop** → new scope (with iterator variable)
- **For-each loop** → new scope (with iterator variable)
- **Catch block** → new scope (with error variable)

### 5.4 Annotations Added to AST

The semantic analyzer annotates certain nodes:

```javascript
// Identifier nodes get scope resolution info
{
    type: "Identifier",
    name: "x",
    resolved: true,         // Was this name found in scope?
    scopeDepth: 2,          // How many scopes up (0 = current scope)
    isMutable: true          // Can this be reassigned?
}
```

### 5.5 Error Format

```
BN Script Error [Semantic Error]

  File: app.bn
  Line: 15

  Cannot reassign constant "API_KEY".
  It was declared as "sthir" on line 3.

  Suggestion:
    Use "dhori" instead of "sthir" if you need to reassign this variable.
```

---

## 6. Stage 5: JavaScript Code Generator

### 6.1 Responsibility

The generator walks the (annotated) AST and produces JavaScript source code. It is a tree-walking code emitter.

### 6.2 Output Format

- **Module format:** ES Modules (`import`/`export`)
- **Style:** Readable, properly indented JavaScript
- **Indentation:** 2 spaces
- **Comments:** The generator adds a header comment identifying the file as generated
- **Source map:** Not in v0.1, but the architecture supports future addition

### 6.3 Generated File Header

Every generated `.js` file begins with:

```javascript
// Generated by BN Script Compiler v0.1
// Source: app.bn
// Do not edit this file directly.
```

### 6.4 Translation Rules

#### Declarations
```
dhori x = 10          →  let x = 10;
sthir PI = 3.14       →  const PI = 3.14;
```

#### Print
```
dekhi x, y            →  console.log(x, y);
```

#### Control Flow
```
jodi x > 0 {          →  if (x > 0) {
    dekhi x           →      console.log(x);
}                     →  }
nahole {              →  else {
    dekhi "neg"       →      console.log("neg");
}                     →  }
```

#### Loops
```
// Counted (simple)
bar 5 { ... }         →  for (let __i = 0; __i < 5; __i++) { ... }

// Counted (named)
bar i = 0 theke 10    →  for (let i = 0; i < 10; i++) {
{ ... }               →      ...
                      →  }

// For-each
bar item ekti arr {   →  for (const item of arr) {
    ...               →      ...
}                     →  }

// While
jotokkhon x < 10 {   →  while (x < 10) {
    ...               →      ...
}                     →  }
```

#### Functions
```
kaj greet(name) {     →  function greet(name) {
    ferot "Hi"        →      return "Hi";
}                     →  }

async kaj fetch() {   →  async function fetch() {
    ...               →      ...
}                     →  }
```

#### Operators
```
x == y                →  x === y
x != y                →  x !== y
x ebong y             →  x && y
x othoba y            →  x || y
na x                  →  !x
```

#### Built-in Operations
```
// HTTP
abr anro(url)                    →  await __bn_fetch(url)
abr anro(url, { method: "POST", →  await __bn_fetch(url, {
    body: data })                →      method: "POST", body: data })

// File
abr faile.read("f.txt")         →  await __bn_file.read("f.txt")
abr faile.write("f.txt", data)  →  await __bn_file.write("f.txt", data)

// AI
abr ai.ask("prompt")            →  await __bn_ai.ask("prompt")

// Environment
env("KEY")                       →  __bn_env("KEY")
env("KEY", "default")            →  __bn_env("KEY", "default")

// Wait
abr wait(2000)                   →  await __bn_wait(2000)

// JSON
json.parse(text)                 →  JSON.parse(text)
json.stringify(obj)              →  JSON.stringify(obj)
```

#### Try/Catch
```
dhoro {               →  try {
    ...               →      ...
} error e {           →  } catch (e) {
    ...               →      ...
} sheshe {            →  } finally {
    ...               →      ...
}                     →  }
```

#### Modules
```
nao { a, b } theke "./utils.bn"  →  import { a, b } from "./utils.js";
nao helpers theke "./h.bn"       →  import helpers from "./h.js";
dao kaj greet() { }               →  export function greet() { }
dao dhori x = 10                  →  export let x = 10;
```

### 6.5 Top-Level Async Strategy

If the program contains any top-level `abr` expression, the generator uses **Top-Level Await (TLA)**, relying on ES Module support in Node.js 18+. No async IIFE wrapper is added, allowing `dao` exports to work correctly.

```javascript
// Generated by BN Script Compiler v0.1
// File runs as ES Module allowing top-level await
```

### 6.6 Runtime Helper Prefix

Built-in operations (`anro`, `faile`, `ai`, `env`, `wait`) compile to calls to runtime helper functions prefixed with `__bn_`. These are injected as imports at the top of the generated file:

```javascript
import { __bn_fetch, __bn_file, __bn_ai, __bn_env, __bn_wait } from "bnscript/runtime";
```

The runtime module is a separate package (see `docs/runtime-design.md`).

### 6.7 Code Emitter Architecture

The generator uses an `Emitter` utility for building output:

```
Emitter:
  - indent()           // Increase indentation level
  - dedent()           // Decrease indentation level
  - emit(code)         // Write code with current indentation
  - emitLine(code)     // Write code + newline with current indentation
  - emitRaw(code)      // Write code without indentation (for inline expressions)
  - getOutput()        // Return the final string
```

The main generator function dispatches by AST node type:

```
generate(node):
    switch (node.type):
        case "Program":           → generateProgram(node)
        case "VarDeclaration":    → generateVarDecl(node)
        case "ConstDeclaration":  → generateConstDecl(node)
        case "PrintStatement":    → generatePrint(node)
        case "IfStatement":       → generateIf(node)
        case "WhileStatement":    → generateWhile(node)
        case "ForLoop":           → generateForLoop(node)
        case "ForEachLoop":       → generateForEach(node)
        case "FunctionDeclaration":→ generateFunction(node)
        case "ReturnStatement":   → generateReturn(node)
        case "TryCatch":         → generateTryCatch(node)
        case "BinaryExpression":  → generateBinary(node)
        case "CallExpression":    → generateCall(node)
        case "MemberExpression":  → generateMember(node)
        ...
```

---

## 7. Error Reporting System

### 7.1 Error Categories

| Category   | Source Stage      | Example                                |
|------------|-------------------|----------------------------------------|
| `LexError` | Lexer            | Unterminated string, invalid character  |
| `ParseError`| Parser          | Unexpected token, unclosed block        |
| `SemanticError`| Analyzer      | Undeclared variable, const reassignment |
| `InternalError`| Any           | Compiler bug (should never reach user)  |

### 7.2 Error Object Structure

```javascript
{
    category: "ParseError",
    message: "Expected \"}\" to close block",
    file: "app.bn",
    line: 12,
    column: 1,
    source: "    dekhi x",           // The source line
    suggestion: "Add a closing \"}\" after line 11",
    relatedLine: 8                   // Optional: related location
}
```

### 7.3 Error Display Format

```
╔══════════════════════════════════════════╗
║  BN Script Error                        ║
╚══════════════════════════════════════════╝

  [Parse Error] in app.bn

  Line 12:
  │
  │   dekhi x
  │         ^

  Expected "}" to close block started at line 8.

  Suggestion:
    Add a closing "}" after line 11.
```

### 7.4 Multiple Error Collection

The compiler collects up to **20 errors** before aborting. This prevents cascading error floods while still being useful for batch fixes.

---

## 8. CLI Interface

### 8.1 Commands

```bash
# Compile a file
bnscript compile app.bn              # → outputs app.js

# Compile and run
bnscript run app.bn                  # → compiles to temp, runs with Node.js

# Check for errors without generating output
bnscript check app.bn                # → parse + analyze, no codegen

# Show version
bnscript --version

# Show help
bnscript --help
```

### 8.2 CLI Flags

```
--output, -o <path>     Output directory (default: same as input)
--verbose, -v           Show compilation stages and timing
--ast                   Dump AST as JSON (for debugging)
--tokens                Dump token list (for debugging)
--no-runtime            Skip runtime import injection
```

### 8.3 Exit Codes

| Code | Meaning                  |
|------|--------------------------|
| 0    | Success                  |
| 1    | Compilation error(s)     |
| 2    | Runtime error            |
| 3    | File not found / IO error|
| 4    | Internal compiler error  |

---

## 9. File Organization

```
bnscript/
├── src/
│   ├── cli.js              # CLI entry point, argument parsing
│   ├── compiler.js          # Pipeline orchestrator (lexer → parser → analyzer → generator)
│   ├── lexer.js             # Stage 1: Tokenization
│   ├── tokens.js            # Token type constants
│   ├── parser.js            # Stage 2: Parsing → AST
│   ├── ast.js               # AST node factory functions
│   ├── analyzer.js          # Stage 3: Semantic analysis
│   ├── generator.js         # Stage 4: JavaScript code generation
│   ├── errors.js            # Error formatting and reporting
│   └── runtime/
│       ├── index.js         # Runtime entry point (exports all helpers)
│       ├── fetch.js         # __bn_fetch implementation
│       ├── file.js          # __bn_file implementation
│       ├── ai.js            # __bn_ai implementation
│       ├── env.js           # __bn_env implementation
│       └── wait.js          # __bn_wait implementation
├── tests/
│   ├── lexer.test.js
│   ├── parser.test.js
│   ├── analyzer.test.js
│   ├── generator.test.js
│   └── fixtures/            # .bn test files with expected .js output
│       ├── hello.bn
│       ├── hello.expected.js
│       ├── variables.bn
│       ├── variables.expected.js
│       └── ...
├── docs/
│   ├── language-spec.md
│   ├── compiler-architecture.md
│   └── runtime-design.md
├── examples/
│   ├── hello.bn
│   ├── api-fetcher.bn
│   ├── file-processor.bn
│   └── ai-workflow.bn
├── package.json
├── AGENTS.md
├── PROJECT_STATUS.md
├── TASKS.md
├── DECISIONS.md
├── CHANGELOG.md
└── NEXT_TASK.md
```

---

## 10. Testing Strategy

### 10.1 Unit Tests Per Stage

Each compiler stage is tested independently:

- **Lexer tests:** Source string → expected token array
- **Parser tests:** Token array (or source string via lexer) → expected AST
- **Analyzer tests:** AST → expected errors (or no errors)
- **Generator tests:** AST → expected JavaScript string

### 10.2 Integration Tests (Fixture-Based)

Each `.bn` file in `tests/fixtures/` has a corresponding `.expected.js` file. The test runner:
1. Compiles the `.bn` file through the full pipeline
2. Compares the output to `.expected.js`
3. Optionally runs the generated JS and checks stdout

### 10.3 Test Framework

Use **Node.js built-in test runner** (`node:test`) — zero dependencies. This aligns with the project's simplicity philosophy.

---

## 11. Performance Considerations

For v0.1, performance is NOT a primary concern. BN Script targets small automation scripts (< 5000 lines). However, the architecture is designed to avoid obvious performance traps:

- **Single-pass per stage:** No back-tracking in the lexer or parser
- **No string concatenation in generator:** Use an array-based emitter that joins at the end
- **Flat token array:** No linked list overhead
- **Plain objects for AST:** No class instantiation overhead

---

*This document defines the internal architecture of the BN Script compiler. All implementation must follow these stage boundaries and interfaces.*
