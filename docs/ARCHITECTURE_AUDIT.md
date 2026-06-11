# BN Script Architecture Audit

Last updated: 2026-06-11

This audit is the public project dashboard for BN Script architecture, implemented language features, test coverage, examples, known limitations, and the recommended roadmap.

## Project Status

Current Version: `0.1.0-alpha.0`

Repository URL: `https://github.com/sayedrisat/bnscript`

Latest Stage: `Stage 27 - VS Code Autocomplete & Hover`

Current Commit: `Pending Stage 27 release commit`

Current Test Count: `283` passing tests

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
* Top-level await
* Automation runtime helper calls
* Try/catch/finally with `dhoro`, `error`, and `sheshe`
* Interactive REPL
* VS Code syntax highlighting assets
* Local VS Code extension package
* VSIX packaging support
* Shared AST traversal utilities
* String interpolation output
* English keyword aliases
* Bilingual diagnostics message catalog and formatter
* VS Code keyword autocomplete and hover documentation

## Compiler Architecture

Lexer:

* Implemented in `src/lexer.js`.
* Converts BN Script source into tokens with source locations.
* Supports identifiers, numbers, strings, comments, keywords, operators, punctuation, newlines, and EOF.
* Normalizes Bangla-style keywords and English aliases to the same token types.

Parser:

* Implemented in `src/parser.js`.
* Recursive descent parser with precedence-based expression parsing.
* Produces plain-object AST nodes and recoverable parse diagnostics.

AST:

* Implemented in `src/ast.js`.
* Uses factory functions for active statement and expression nodes.
* Preserves source location metadata on nodes.
* Range `ForLoop` uses the shared node helper while preserving expression `start` and `end` fields.

Semantic Analyzer:

* Implemented in `src/analyzer.js`.
* Performs scope resolution, duplicate declaration checks, use-before-declaration checks, const reassignment checks, function scope checks, loop scope checks, and loop-control placement checks.

Generator:

* Implemented in `src/generator.js`.
* Emits readable JavaScript with a generated-file header and 2-space indentation.
* Translates BN Script declarations, expressions, functions, loops, loop control, and print statements to JavaScript.

CLI:

* Implemented in `src/cli.js`.
* Supports `check`, `build`, `run`, and `repl`.

REPL:

* Implemented in `src/repl.js`.
* Reuses the compiler pipeline for each submitted entry.
* Validates accumulated session source so prior declarations remain visible to later entries.
* Executes only the newly generated JavaScript chunk inside a shared Node.js VM context.
* Wraps chunks that contain top-level await so awaited expressions execute cleanly.
* Supports `.help`, `.exit`, `.clear`, and `.version`.

Runtime:

* Implemented under `src/runtime/`.
* Provides current runtime helper foundation for env, file, fetch, wait, runtime errors, and runtime exports.
* Canonical runtime helper names are defined in `src/runtime/helpers.js`.

Compiler Utilities:

* `src/ast-walker.js` provides reusable safe AST traversal for compiler utilities.
* The generator and REPL reuse the shared AST walker for helper and top-level await detection.
* `src/diagnostics/messages.js` provides the bilingual diagnostics message catalog and `formatDiagnostic()` formatter.

Tooling:

* Local VS Code extension package assets live under `vscode/`.
* `vscode/package.json` contributes the `bnscript` language id and `.bn` file association.
* `vscode/bnscript.tmLanguage.json` provides TextMate grammar highlighting.
* `vscode/language-configuration.json` provides comments, brackets, and auto-closing pairs.
* `vscode/assets/icon.png` provides the package-safe extension icon.
* `vscode/assets/icon.svg` remains a source placeholder icon.
* `vscode/samples/demo.bn` provides a syntax showcase inside the extension package.
* `vscode/src/keywords.js` stores shared keyword metadata for editor features.
* `vscode/src/extension.js` registers keyword autocomplete and hover documentation providers.
* `npm run build:vsix` packages the local extension with `@vscode/vsce`.
* Generated VSIX files are written under ignored `dist/`.

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
* Await expressions inside async functions and top-level programs
* Runtime helper calls with `env`, `fileRead`, `fileWrite`, `wait`, and `httpGet`
* Try/catch/finally statements with `dhoro`, `error`, and `sheshe`
* Interactive REPL sessions with persistent variables
* Local VS Code extension package for `.bn` syntax highlighting
* String interpolation output for strings containing `${...}`
* English keyword aliases for Bangla-style keywords
* Mixed Bangla/English source style
* Bilingual compiler diagnostics with Bangla/Banglish text, English text, and hints
* VS Code keyword autocomplete and hover documentation
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

* Stage 27: VS Code Autocomplete & Hover

## AST Changes

Latest completed stage:

* No AST changes.
* Stage 27 added editor tooling without changing AST node names.

Current AST model:

* Plain-object AST nodes produced by factory functions in `src/ast.js`.
* Source location metadata is preserved on active nodes.
* Range `ForLoop` nodes use expression fields named `start` and `end`.
* Async functions use the existing `FunctionDeclaration` node instead of a separate `AsyncFunctionDeclaration` node.
* Try statements store `tryBlock`, optional `catchParam`, optional `catchBlock`, and optional `finallyBlock`.

## Parser Changes

Latest completed stage:

* No parser changes.
* Stage 27 uses VS Code extension APIs outside the compiler parser.

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

* No analyzer changes.
* Stage 27 does not affect compiler semantic validation.

Current analyzer checks:

* Declaration tracking
* Duplicate declaration errors
* Use-before-declaration errors
* Constant reassignment errors
* Function scopes and parameter scopes
* Duplicate parameter errors
* Return placement errors
* Await placement errors for non-async function bodies
* Loop scopes and iterator scopes
* Break/continue placement errors
* Catch parameter scoping
* Imported identifier declarations
* Export-wrapped declaration validation
* Member/index base resolution
* Assignment target validation
* Bilingual formatting for major semantic diagnostics

## Generator Changes

Latest completed stage:

* No generator changes.
* Stage 27 does not affect JavaScript output.

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
* interpolated BN strings -> JavaScript template literals
* BN Script expressions -> readable JavaScript expressions

## Diagnostics

Latest completed stage:

* Added `formatDiagnostic(code, details)` in `src/diagnostics/messages.js`.
* Major diagnostics now include `Bangla`, `English`, and `Hint` sections.
* Analyzer diagnostics carry reusable `code` and `details` metadata on `BNError`.

Current bilingual diagnostic coverage:

* `UNDECLARED_VARIABLE`
* `DUPLICATE_DECLARATION`
* `CONST_REASSIGNMENT`
* `AWAIT_SCOPE_ERROR`
* `RETURN_OUTSIDE_FUNCTION`
* `BREAK_OUTSIDE_LOOP`
* `CONTINUE_OUTSIDE_LOOP`
* `DUPLICATE_PARAMETER`
* `IMPORT_ERROR`
* `EXPORT_ERROR`

## VS Code Extension

Latest completed stage:

* Added a Completion Provider for BN Script keywords.
* Added a Hover Provider for keyword documentation.
* Added shared keyword metadata in `vscode/src/keywords.js`.
* Updated the extension manifest with `main` and `onLanguage:bnscript` activation.

Current editor support:

* `.bn` file association
* TextMate syntax highlighting
* Language configuration for comments, brackets, and auto-closing pairs
* VSIX packaging with `npm run build:vsix`
* Keyword autocomplete for Bangla-style keywords and English aliases
* Hover documentation with Bangla/Banglish and English descriptions

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

Fully supported Bangla-style keywords and keyword-like operators:

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

Fully supported English aliases:

* `let`
* `const`
* `print`
* `if`
* `else`
* `while`
* `for`
* `from`
* `to`
* `of`
* `import`
* `export`
* `function`
* `return`
* `break`
* `continue`
* `try`
* `catch`
* `finally`
* `true`
* `false`
* `null`
* `and`
* `or`
* `not`

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

* None

Runnable `.bn` examples in `examples/`:

* `arrays.bn`
* `assignments.bn`
* `async.bn`
* `break.bn`
* `continue.bn`
* `english.bn`
* `errors/await-error.bn`
* `errors/const-error.bn`
* `errors/undeclared.bn`
* `for.bn`
* `foreach.bn`
* `functions.bn`
* `hello.bn`
* `if.bn`
* `interpolation.bn`
* `logic.bn`
* `module-main.bn`
* `module-utils.bn`
* `mixed-style.bn`
* `objects.bn`
* `repl.txt`
* `runtime.bn`
* `syntax-highlighting.bn`
* `top-level-await.bn`
* `try.bn`
* `variables.bn`
* `while.bn`

## Tests

New tests added in the latest completed stage:

* Keyword registry coverage for core Bangla-style keywords and English aliases.
* Hover documentation coverage for `dhori`, `kaj`, and `await`.
* Duplicate keyword guard for the registry.
* Extension manifest activation and package-file coverage.

Current total passing tests: `283`

Primary test files:

* Parser tests: `tests/parser.test.js`
* Analyzer tests: `tests/analyzer.test.js`
* Generator tests: `tests/generator.test.js`
* Lexer tests: `tests/lexer.test.js`
* Runtime tests: `tests/runtime.test.js`
* CLI tests: `tests/cli.test.js`
* REPL tests: `tests/repl.test.js`
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
  * `tests/stage20.integration.test.js`
  * `tests/stage21.syntax.test.js`
  * `tests/stage22.audit.test.js`
  * `tests/stage23.extension.test.js`
  * `tests/stage24.vsix.test.js`
  * `tests/stage25.aliases.test.js`
  * `tests/stage26.diagnostics.test.js`
  * `tests/stage27.vscode.test.js`

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
* `top-level-await.bn`
* `try.bn`
* `variables.bn`
* `while.bn`

## Current Test Count

Current total passing tests: `283`

## Known Limitations

Major missing or incomplete features:

* Default imports
* Namespace imports
* Re-exports
* Full module graph analysis
* Cross-file semantic validation
* Circular dependency diagnostics
* Promise API design
* Interpolation contents are passed through to JS template literals without BN Script expression parsing
* Simple repeat `bar 5 { ... }` loops
* Multi-line REPL block editing
* Import/export execution inside the REPL
* Function default parameters
* Function expressions
* Arrow functions
* Methods
* Advanced object/array shape validation
* AI runtime helpers
* Package publishing
* VS Code Marketplace publishing
* VS Code language server features
* VS Code diagnostics integration, formatter, snippets, debugger, and semantic completions
* Language Server Protocol (LSP)
* Source maps
* Remaining lower-priority parser, lexer, runtime, and CLI diagnostics still need bilingual migration
* Diagnostic localization preferences are not implemented yet

## Recommended Next Stage

Stage 28:

* Module Graph Analysis

Stage 29:

* Advanced Runtime Helpers and AI Integration
