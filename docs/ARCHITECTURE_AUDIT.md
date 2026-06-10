# BN Script Architecture Audit

Last updated: 2026-06-10

This audit is the public project dashboard for BN Script architecture, implemented language features, test coverage, examples, known limitations, and the recommended roadmap.

## Project Status

Current Version: `0.1.0-alpha.0`

Repository URL: `https://github.com/sayedrisat/bnscript`

Latest Stage: `Stage 18 - Try/Catch/Finally`

Current Commit: `455dbbbad9e1b03f99532914a0853608498e2de6`

Current Test Count: `229` passing tests

Current Compiler Stages Completed:

* Lexer
* Parser
* Abstract Syntax Tree (AST)
* Semantic Analyzer
* JavaScript Generator
* Runtime System
* CLI Tool
* Function declarations, parameters, returns, and calls
* Assignment expressions
* `jotokkhon` while loops
* Array literals
* Object literals
* Member access
* Index access
* Range `bar` loops
* For-each `bar` loops
* `bekkhon` break statements
* `cholo` continue statements
* Named imports with `amdani`
* Export declarations with `roptani`
* Async function declarations with `async kaj`
* Await expressions with `await`
* Automation runtime helper calls
* Try/catch/finally with `dhoro`, `error`, and `sheshe`

## Compiler Architecture

Lexer:

* Implemented in `src/lexer.js`.
* Converts BN Script source into tokens with source locations.
* Supports identifiers, numbers, strings, comments, keywords, operators, punctuation, newlines, and EOF.

Parser:

* Implemented in `src/parser.js`.
* Recursive descent parser with precedence-based expression parsing.
* Produces plain-object AST nodes and recoverable parse diagnostics.

AST:

* Implemented in `src/ast.js`.
* Uses factory functions for active statement and expression nodes.
* Preserves source location metadata on nodes.

Semantic Analyzer:

* Implemented in `src/analyzer.js`.
* Performs scope resolution, duplicate declaration checks, use-before-declaration checks, const reassignment checks, function scope checks, loop scope checks, and loop-control placement checks.

Generator:

* Implemented in `src/generator.js`.
* Emits readable JavaScript with a generated-file header and 2-space indentation.
* Translates BN Script declarations, expressions, functions, loops, loop control, and print statements to JavaScript.

CLI:

* Implemented in `src/cli.js`.
* Supports `check`, `build`, and `run`.

Runtime:

* Implemented under `src/runtime/`.
* Provides current runtime helper foundation for env, file, fetch, wait, runtime errors, and runtime exports.

## Features Implemented

Current implemented language features:

* Variable declarations with `dhori`
* Constant declarations with `sthir`
* Print statements with `dekhi`
* If/else conditionals with `jodi` and `nahole`
* `jotokkhon` while loops
* Range `bar` loops with `theke`
* For-each `bar` loops with `ekti`
* Loop control with `bekkhon` and `cholo`
* Function declarations with `kaj`
* Function parameters
* Return statements with `ferot`
* Function calls
* Named imports with `amdani { name } theke "./file.bn"`
* Exported functions, variables, and constants with `roptani`
* Async function declarations with `async kaj`
* Await expressions inside async functions
* Runtime helper calls with `env`, `fileRead`, `fileWrite`, `wait`, and `httpGet`
* Try/catch/finally statements with `dhoro`, `error`, and `sheshe`
* Assignment expressions
* Compound assignment
* Array literals
* Object literals
* Member access
* Index access
* Primitive literals: number, string, boolean, null
* Unary expressions
* Binary expressions
* Grouped expressions
* Blocks and expression statements

Latest completed stage:

* Stage 18: Try/Catch/Finally

## AST Changes

Latest completed stage:

* Added `TryStatement`.

Current AST model:

* Plain-object AST nodes produced by factory functions in `src/ast.js`.
* Source location metadata is preserved on active nodes.
* Range `ForLoop` nodes use expression fields named `start` and `end`.
* Async functions use the existing `FunctionDeclaration` node instead of a separate `AsyncFunctionDeclaration` node.
* Try statements store `tryBlock`, optional `catchParam`, optional `catchBlock`, and optional `finallyBlock`.

## Parser Changes

Latest completed stage:

* Added try/catch parsing for `dhoro { ... } error err { ... }`.
* Added try/finally parsing for `dhoro { ... } sheshe { ... }`.
* Added try/catch/finally parsing for `dhoro { ... } error err { ... } sheshe { ... }`.
* `dhoro` statements require at least one `error` or `sheshe` block.

Current parser grammar support:

* Declarations
* Print statements
* Conditionals
* While loops
* Range loops
* For-each loops
* Break and continue statements
* Try/catch/finally statements
* Import declarations
* Export declarations
* Function declarations
* Async function declarations
* Return statements
* Blocks
* Expression statements
* Assignment, await, binary, unary, call, member, index, array, object, literal, identifier, and grouped expressions

## Analyzer Changes

Latest completed stage:

* Added try statement analysis.
* Catch variables are declared in a catch-only block scope.
* Catch variables resolve inside their catch block and do not leak afterward.

Current analyzer checks:

* Declaration tracking
* Duplicate declaration errors
* Use-before-declaration errors
* Constant reassignment errors
* Function scopes and parameter scopes
* Duplicate parameter errors
* Return placement errors
* Await placement errors
* Loop scopes and iterator scopes
* Break/continue placement errors
* Catch parameter scoping
* Imported identifier declarations
* Export-wrapped declaration validation
* Member/index base resolution
* Assignment target validation

## Generator Changes

Latest completed stage:

* Added JavaScript output for `try`.
* Added JavaScript output for `catch (err)`.
* Added JavaScript output for `finally`.

Current generator output support:

* `dhori` -> `let`
* `sthir` -> `const`
* `dekhi` -> `console.log`
* `jodi` / `nahole` -> `if` / `else`
* `jotokkhon` -> `while`
* range `bar` -> JavaScript `for`
* for-each `bar` -> JavaScript `for...of`
* `bekkhon` -> `break`
* `cholo` -> `continue`
* `dhoro` / `error` / `sheshe` -> `try` / `catch` / `finally`
* `kaj` -> `function`
* `async kaj` -> `async function`
* `ferot` -> `return`
* `await` -> `await`
* `amdani` -> ESM `import`
* `roptani` -> ESM `export`
* BN Script expressions -> readable JavaScript expressions

## Supported Statements

* Program
* ImportDeclaration
* ExportDeclaration
* VarDeclaration
* ConstDeclaration
* PrintStatement
* IfStatement
* TryStatement
* WhileStatement
* ForLoop
* ForEachLoop
* BreakStatement
* ContinueStatement
* FunctionDeclaration
* ReturnStatement
* BlockStatement
* ExpressionStatement

## Supported Expressions

* Identifier
* NumberLiteral
* StringLiteral
* BooleanLiteral
* NullLiteral
* UnaryExpression
* AwaitExpression
* BinaryExpression
* AssignmentExpression
* CallExpression
* MemberExpression
* ArrayLiteral
* ObjectLiteral

## Keywords

Fully supported keywords and keyword-like operators:

* `dhori`
* `sthir`
* `dekhi`
* `jodi`
* `nahole`
* `jotokkhon`
* `bar`
* `theke`
* `ekti`
* `amdani`
* `roptani`
* `async`
* `await`
* `kaj`
* `ferot`
* `bekkhon`
* `cholo`
* `dhoro`
* `error`
* `sheshe`
* `sotti`
* `mittha`
* `khali`
* `ebong`
* `othoba`
* `na`

Lexed compatibility spelling:

* `abr` as an older await spelling; `await` is preferred for Stage 16.

Lexed and reserved, but not fully supported by the parser/generator yet:

* `nao`
* `dao`

## Operators

Arithmetic:

* `+`
* `-`
* `*`
* `/`
* `%`
* `**`

Comparison and equality:

* `==`
* `!=`
* `>`
* `<`
* `>=`
* `<=`

Logical and unary:

* `ebong`
* `othoba`
* `na`
* unary `-`

Assignment:

* `=`
* `+=`
* `-=`
* `*=`
* `/=`

Access and calls:

* `.` member access
* `[]` index access
* `()` function calls and grouped expressions

New operators introduced in the latest completed stage:

* None

## AST Nodes

Active AST nodes:

* Program
* ImportSpecifier
* ImportDeclaration
* ExportDeclaration
* VarDeclaration
* ConstDeclaration
* PrintStatement
* IfStatement
* TryStatement
* WhileStatement
* ForLoop
* ForEachLoop
* BlockStatement
* FunctionDeclaration
* Parameter
* ReturnStatement
* BreakStatement
* ContinueStatement
* ExpressionStatement
* Identifier
* NumberLiteral
* StringLiteral
* BooleanLiteral
* NullLiteral
* UnaryExpression
* AwaitExpression
* BinaryExpression
* AssignmentExpression
* CallExpression
* MemberExpression
* ArrayLiteral
* ObjectLiteral
* ObjectProperty

## Examples

New example files added in the latest completed stage:

* `try.bn`

Runnable `.bn` examples in `examples/`:

* `arrays.bn`
* `assignments.bn`
* `async.bn`
* `break.bn`
* `continue.bn`
* `for.bn`
* `foreach.bn`
* `functions.bn`
* `hello.bn`
* `if.bn`
* `logic.bn`
* `module-main.bn`
* `module-utils.bn`
* `objects.bn`
* `runtime.bn`
* `try.bn`
* `variables.bn`
* `while.bn`

## Tests

New tests added in the latest completed stage:

* Parser coverage for try/catch, try/finally, try/catch/finally, and invalid try without catch/finally.
* Analyzer coverage for catch variable resolution and catch variable non-leakage.
* Generator coverage for try/catch, try/finally, and try/catch/finally output.
* Integration coverage for `tests/integration/try.bn`.

Current total passing tests: `229`

Primary test files:

* Parser tests: `tests/parser.test.js`
* Analyzer tests: `tests/analyzer.test.js`
* Generator tests: `tests/generator.test.js`
* Lexer tests: `tests/lexer.test.js`
* Runtime tests: `tests/runtime.test.js`
* CLI tests: `tests/cli.test.js`
* Integration tests:
  * `tests/functions.integration.test.js`
  * `tests/stage8-9.integration.test.js`
  * `tests/stage10.integration.test.js`
  * `tests/stage11-12.integration.test.js`
  * `tests/stage13-14.integration.test.js`
  * `tests/stage15.integration.test.js`
  * `tests/stage16.integration.test.js`
  * `tests/stage17.integration.test.js`
  * `tests/stage18.integration.test.js`

Integration fixtures in `tests/integration/`:

* `arrays.bn`
* `assignments.bn`
* `async.bn`
* `break.bn`
* `continue.bn`
* `for.bn`
* `foreach.bn`
* `functions.bn`
* `hello.bn`
* `if.bn`
* `module-main.bn`
* `module-utils.bn`
* `objects.bn`
* `runtime.bn`
* `semantic-error.bn`
* `try.bn`
* `variables.bn`
* `while.bn`

## Current Test Count

Current total passing tests: `229`

## Known Limitations

Major missing or incomplete features:

* Default imports
* Namespace imports
* Re-exports
* Full module graph analysis
* Cross-file semantic validation
* Circular dependency diagnostics
* Top-level await execution model
* Promise API design
* Simple repeat `bar 5 { ... }` loops
* Function default parameters
* Function expressions
* Arrow functions
* Methods
* Advanced object/array shape validation
* AI runtime helpers
* Package publishing
* REPL
* Language Server Protocol (LSP)
* VS Code extension
* Source maps

## Recommended Next Stage

Stage 19:

* REPL

Stage 20:

* Module Graph Analysis

Stage 21:

* Advanced Runtime Helpers and AI Integration
