# BN Script Architecture Audit

Last updated: 2026-06-09

This audit is the public project dashboard for BN Script architecture, implemented language features, test coverage, examples, known limitations, and the recommended roadmap.

## Project Status

Current Version: `0.1.0-alpha.0`

Repository URL: `https://github.com/sayedrisat/bnscript`

Latest Stage: `Stage 15 - Imports / Exports`

Current Commit: `Pending Stage 15 release commit`

Current Test Count: `202` passing tests

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

* Stage 15: Imports / Exports

## AST Changes

Latest completed stage:

* Added `ImportSpecifier`.
* Added `ImportDeclaration`.
* Added `ExportDeclaration`.

Current AST model:

* Plain-object AST nodes produced by factory functions in `src/ast.js`.
* Source location metadata is preserved on active nodes.
* Range `ForLoop` nodes use expression fields named `start` and `end`.

## Parser Changes

Latest completed stage:

* Added named import parsing for `amdani { name } theke "./file.bn"`.
* Added exported function parsing for `roptani kaj name(...) { ... }`.
* Added exported variable parsing for `roptani dhori name = value`.
* Added exported constant parsing for `roptani sthir name = value`.

Current parser grammar support:

* Declarations
* Print statements
* Conditionals
* While loops
* Range loops
* For-each loops
* Break and continue statements
* Import declarations
* Export declarations
* Function declarations
* Return statements
* Blocks
* Expression statements
* Assignment, binary, unary, call, member, index, array, object, literal, identifier, and grouped expressions

## Analyzer Changes

Latest completed stage:

* Added import declaration validation.
* Imported identifiers are declared in the current scope.
* Import sources must be string literals.
* Export declarations wrap normal declaration nodes and reuse the standard declaration visitor path.
* Export semantic metadata records the wrapped declaration type.

Current analyzer checks:

* Declaration tracking
* Duplicate declaration errors
* Use-before-declaration errors
* Constant reassignment errors
* Function scopes and parameter scopes
* Duplicate parameter errors
* Return placement errors
* Loop scopes and iterator scopes
* Break/continue placement errors
* Imported identifier declarations
* Export-wrapped declaration validation
* Member/index base resolution
* Assignment target validation

## Generator Changes

Latest completed stage:

* Added JavaScript ESM output for named imports.
* Added `.bn` to `.js` import path conversion.
* Added JavaScript output for exported functions.
* Added JavaScript output for exported variables as `export let`.
* Added JavaScript output for exported constants as `export const`.

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
* `kaj` -> `function`
* `ferot` -> `return`
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
* `kaj`
* `ferot`
* `bekkhon`
* `cholo`
* `sotti`
* `mittha`
* `khali`
* `ebong`
* `othoba`
* `na`

Lexed and reserved, but not fully supported by the parser/generator yet:

* `nao`
* `dao`
* `dhoro`
* `error`
* `sheshe`
* `abr`
* `async`

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
* BinaryExpression
* AssignmentExpression
* CallExpression
* MemberExpression
* ArrayLiteral
* ObjectLiteral
* ObjectProperty

## Examples

New example files added in the latest completed stage:

* `module-main.bn`
* `module-utils.bn`

Runnable `.bn` examples in `examples/`:

* `arrays.bn`
* `assignments.bn`
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
* `variables.bn`
* `while.bn`

## Tests

New tests added in the latest completed stage:

* Parser coverage for single imports, multiple imports, exported functions, exported variables, exported constants, and invalid module syntax.
* Analyzer coverage for imported identifier resolution, duplicate import declarations, string-literal import sources, valid exports, and invalid export declarations.
* Generator coverage for named imports, `.bn` to `.js` source path conversion, exported functions, exported variables, and exported constants.
* Integration coverage for `tests/integration/module-main.bn` and `tests/integration/module-utils.bn`.

Current total passing tests: `202`

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

Integration fixtures in `tests/integration/`:

* `arrays.bn`
* `assignments.bn`
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
* `semantic-error.bn`
* `variables.bn`
* `while.bn`

## Current Test Count

Current total passing tests: `202`

## Known Limitations

Major missing or incomplete features:

* Default imports
* Namespace imports
* Re-exports
* Full module graph analysis
* Cross-file semantic validation
* Circular dependency diagnostics
* Async/await
* Top-level await execution model
* Try/catch/finally
* Simple repeat `bar 5 { ... }` loops
* Function default parameters
* Function expressions
* Arrow functions
* Methods
* Advanced object/array shape validation
* Runtime automation helper language integration
* AI runtime helpers
* Package publishing
* REPL
* Language Server Protocol (LSP)
* VS Code extension
* Source maps

## Recommended Next Stage

Stage 16:

* Async / Await

Stage 17:

* Automation Runtime Helpers

Stage 18:

* Module Graph Analysis
