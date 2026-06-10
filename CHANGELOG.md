# Changelog

## Day 10 - 2026-06-10 (Top-Level Await Stage 20)

### Completed: Top-Level Await
- Allowed `await` expressions in top-level program scope.
- Kept `await` valid inside `async kaj` functions.
- Kept `await` invalid inside non-async `kaj` functions.
- Added declaration parsing support for multiline initializers after `=`.
- Preserved existing JavaScript generation as native top-level `await`.
- Updated REPL execution so top-level `await` runs in the interactive session.
- Added `examples/top-level-await.bn`.

### Tests Added
- Parser coverage for multiline top-level await initializers.
- Analyzer coverage for valid top-level await and invalid non-async function await.
- Generator coverage for top-level await output with runtime helpers.
- REPL coverage for top-level await execution and awaited declaration persistence.
- Integration coverage for `tests/integration/top-level-await.bn`.

### Known Issues
- Top-level await uses native ES module semantics in built files and CLI run output.
- Multi-line REPL block editing is still not implemented.
- Full module graph analysis, AI helpers, editor tooling, LSP, source maps, and package publishing remain future work.

### Test Result
- `npm.cmd test` passed 244 tests.
- `node src/cli.js check examples/top-level-await.bn` passed.
- `node src/cli.js build examples/top-level-await.bn` passed.
- `node src/cli.js run examples/top-level-await.bn` printed `done`.
- REPL validation with `await wait(1)` passed.

### Recommended Next Task
- Stage 21 Module Graph Analysis

---

## Day 10 - 2026-06-10 (REPL Stage 19)

### Completed: Interactive REPL
- Added `node src/cli.js repl` and `bn repl` command support.
- Added an interactive REPL banner, prompt, and session command handling.
- Added `.help`, `.exit`, `.clear`, and `.version` REPL commands.
- Reused the existing compiler pipeline for REPL input.
- Preserved successful variable declarations across a REPL session.
- Reported compiler and runtime errors without exiting the REPL.
- Added `examples/repl.txt` with a public REPL transcript.

### Tests Added
- CLI coverage for launching the REPL and exiting cleanly.
- REPL coverage for `.help`, `.exit`, `.clear`, and `.version`.
- REPL coverage for print statements and persistent variables.
- REPL coverage for compile error recovery and runtime error recovery.

### Known Issues
- Multi-line REPL block editing is not implemented yet.
- Import/export execution inside the REPL is not supported yet.
- Full module graph analysis, top-level await, AI helpers, package publishing, editor tooling, LSP, and source maps remain future work.

### Test Result
- `npm.cmd test` passed 238 tests.
- Manual REPL check with `dhori x = 10` then `dekhi x` printed `10`.

### Recommended Next Task
- Stage 20 Module Graph Analysis

---

## Day 10 - 2026-06-10 (Try/Catch/Finally Stage 18)

### Completed: Try/Catch/Finally
- Added `TryStatement` AST support.
- Added parser support for `dhoro { ... } error err { ... }`.
- Added parser support for `dhoro { ... } sheshe { ... }`.
- Added parser support for `dhoro { ... } error err { ... } sheshe { ... }`.
- Added semantic analysis for catch variable scoping.
- Added JavaScript generation for `try`, `catch`, and `finally`.
- Added `examples/try.bn` and integration fixture coverage.

### Tests Added
- Parser coverage for try/catch, try/finally, try/catch/finally, and invalid try without catch/finally.
- Analyzer coverage for catch variable resolution and catch variable non-leakage.
- Generator coverage for try/catch, try/finally, and try/catch/finally output.
- Integration coverage for `tests/integration/try.bn`.

### Known Issues
- Catch variable type/shape validation is not implemented.
- Runtime helpers remain intentionally small.
- Full module graph analysis, default imports, namespace imports, re-exports, top-level await, AI helpers, package publishing, editor tooling, LSP, and REPL support remain future work.
- `README.md` still contains pre-existing mojibake and was skipped in this run to avoid fragile patching.

### Test Result
- `npm.cmd test` passed 229 tests.
- `node src/cli.js check examples/try.bn` passed.
- `node src/cli.js build examples/try.bn` generated JavaScript `try`, `catch`, and `finally`.

### Recommended Next Task
- Stage 19 Module Graph Analysis

---

## Day 9 - 2026-06-09 (Imports and Exports Stage 15)

### Completed: Imports and Exports
- Added lexer keywords for `amdani` imports and `roptani` exports.
- Added parser support for named imports from BN Script files.
- Added parser support for exported function, variable, and constant declarations.
- Added AST nodes for `ImportSpecifier`, `ImportDeclaration`, and `ExportDeclaration`.
- Added semantic analysis for imported identifiers, import source literals, and export-wrapped declarations.
- Added JavaScript ESM generation for named imports and exported declarations.
- Converted `.bn` import paths to `.js` in generated JavaScript.
- Moved the architecture audit dashboard from `reviews/` to `docs/`.

### Tests Added
- Parser coverage for single and multiple imports, exported functions, exported variables, exported constants, and invalid module syntax.
- Analyzer coverage for imported identifier resolution, duplicate imports, source literal validation, valid exports, and invalid export wrapping.
- Generator coverage for named import output, `.bn` to `.js` path conversion, exported functions, exported variables, and exported constants.
- Integration coverage for `tests/integration/module-main.bn` and `tests/integration/module-utils.bn`.

### Files Changed
- `src/tokens.js`
- `src/ast.js`
- `src/parser.js`
- `src/analyzer.js`
- `src/generator.js`
- `tests/parser.test.js`
- `tests/analyzer.test.js`
- `tests/generator.test.js`
- `tests/stage15.integration.test.js`
- `tests/integration/module-main.bn`
- `tests/integration/module-utils.bn`
- `examples/module-main.bn`
- `examples/module-utils.bn`
- `examples/README.md`
- `docs/ARCHITECTURE_AUDIT.md`
- `docs/getting-started.md`
- `docs/language-spec.md`
- `CHANGELOG.md`

### Known Issues
- Stage 15 does not perform full module graph analysis, cross-file semantic validation, circular dependency diagnostics, default imports, namespace imports, or re-exports.
- Async/await, try/catch/finally, AI helpers, package publishing, default parameters, function expressions, and advanced type/shape validation remain unimplemented.
- `README.md` still contains pre-existing mojibake and was skipped in this run to avoid fragile patching.

### Test Result
- `npm.cmd test` passed 202 tests.
- `node src/cli.js check examples/module-main.bn` passed.
- `node src/cli.js build examples/module-main.bn` generated an ESM import using `./module-utils.js`.
- `node src/cli.js build examples/module-utils.bn` generated an exported JavaScript function.

### Recommended Next Task
- Stage 16 Async / Await

---

## Day 8 - 2026-06-09 (Break and Continue Stage 13/14)

### Completed: Break and Continue
- Added parser support for `bekkhon` break statements.
- Added parser support for `cholo` continue statements.
- Added AST factories for `BreakStatement` and `ContinueStatement`.
- Reused existing semantic analyzer loop-depth validation for break and continue placement.
- Added JavaScript generation for `break;` and `continue;`.
- Added break and continue examples plus integration fixtures.
- Updated public documentation for Stage 13 and Stage 14 support.

### Tests Added
- Parser coverage for break and continue statements in while, range, and for-each loops.
- Analyzer coverage for valid break and continue inside loops while preserving outside-loop errors.
- Generator coverage for break and continue inside while, range, and for-each loops.
- Integration coverage for `tests/integration/break.bn` and `tests/integration/continue.bn`.

### Files Changed
- `src/ast.js`
- `src/parser.js`
- `src/generator.js`
- `tests/parser.test.js`
- `tests/analyzer.test.js`
- `tests/generator.test.js`
- `tests/stage13-14.integration.test.js`
- `tests/integration/break.bn`
- `tests/integration/continue.bn`
- `examples/break.bn`
- `examples/continue.bn`
- `README.md`
- `docs/getting-started.md`
- `docs/language-spec.md`
- `CHANGELOG.md`

### Known Issues
- Simple repeat `bar 5 { ... }` loops, imports/exports, async/await, AI helpers, package publishing, default parameters, function expressions, and advanced type/shape validation remain unimplemented.

### Test Result
- `npm.cmd test` passed 182 tests.
- `node src/cli.js run examples/break.bn` printed `0`, `1`, `2`, `3`, `4`.
- `node src/cli.js run examples/continue.bn` printed `0`, `1`, `3`, `4`.

### Recommended Next Task
- Stage 13/14 Break and Continue Review

---

## Day 7 - 2026-06-09 (Range and For-Each Loops Stage 11/12)

### Completed: Range and For-Each Loops
- Added parser support for range loops using `bar i = start theke end { ... }`.
- Added parser support for for-each loops using `bar item ekti iterable { ... }`.
- Added AST factories for `ForLoop` and `ForEachLoop`.
- Added semantic analysis for loop scopes, iterator declarations, range bounds, iterable expressions, and iterator visibility.
- Added JavaScript generation for range `for` loops and `for...of` loops.
- Added range and for-each examples plus integration fixtures.
- Updated public documentation for Stage 11 and Stage 12 support.

### Tests Added
- Parser coverage for range loops, nested range loops, for-each loops, for-each member access, and missing loop blocks.
- Analyzer coverage for loop scope, nested iterator resolution, iterable resolution, member iterable resolution, and iterator leakage errors.
- Generator coverage for range loop output, for-each output, and nested loops.
- Integration coverage for `tests/integration/for.bn` and `tests/integration/foreach.bn`.

### Files Changed
- `src/ast.js`
- `src/parser.js`
- `src/analyzer.js`
- `src/generator.js`
- `tests/parser.test.js`
- `tests/analyzer.test.js`
- `tests/generator.test.js`
- `tests/stage11-12.integration.test.js`
- `tests/integration/for.bn`
- `tests/integration/foreach.bn`
- `examples/for.bn`
- `examples/foreach.bn`
- `README.md`
- `docs/getting-started.md`
- `docs/language-spec.md`
- `CHANGELOG.md`

### Known Issues
- Simple repeat `bar 5 { ... }` loops, imports/exports, async/await, AI helpers, package publishing, default parameters, function expressions, and advanced type/shape validation remain unimplemented.
- `docs/compiler-architecture.md` was intentionally skipped in this run because its existing corrupted arrow text made exact patching unsafe.

### Test Result
- `npm.cmd test` passed 167 tests.
- `node src/cli.js run examples/for.bn` printed `0`, `1`, `2`, `3`, `4`.
- `node src/cli.js run examples/foreach.bn` printed `Risat`, `BN`, `Script`.

### Recommended Next Task
- Stage 11/12 Range and For-Each Loops Review

---

## Day 6 - 2026-06-08 (Composite Data Stage 10)

### Completed: Arrays, Objects, Members, and Indexes
- Added parser support for array literals, object literals, member access, index access, and chained access.
- Added assignment target support for member and index expressions while keeping direct `sthir` reassignment protection.
- Added AST factories for `ArrayLiteral`, `ObjectLiteral`, `ObjectProperty`, and `MemberExpression`.
- Added semantic analysis for array elements, object property values, member access bases, index bases, computed index expressions, and member/index assignments.
- Added JavaScript generation for arrays, objects, member access, index access, and member/index assignment.
- Added array and object examples plus integration fixtures.
- Updated public documentation for Stage 10 support.

### Tests Added
- Lexer coverage for array/object/member/index punctuation.
- Parser coverage for arrays, nested arrays, objects, nested objects, member access, chained access, indexing, and member/index assignment targets.
- Analyzer coverage for array/object identifier resolution, member/index base resolution, undeclared bases, and member/index assignments.
- Generator coverage for arrays, nested arrays, objects, nested objects, chained access, indexing, and member/index assignment output.
- Integration coverage for `tests/integration/arrays.bn` and `tests/integration/objects.bn`.

### Files Changed
- `src/ast.js`
- `src/parser.js`
- `src/analyzer.js`
- `src/generator.js`
- `tests/lexer.test.js`
- `tests/parser.test.js`
- `tests/analyzer.test.js`
- `tests/generator.test.js`
- `tests/stage10.integration.test.js`
- `tests/integration/arrays.bn`
- `tests/integration/objects.bn`
- `examples/arrays.bn`
- `examples/objects.bn`
- `examples/README.md`
- `README.md`
- `docs/getting-started.md`
- `docs/language-spec.md`
- `docs/compiler-architecture.md`
- `CHANGELOG.md`

### Known Issues
- Counted `bar` loops, for-each loops, imports/exports, async/await, AI helpers, package publishing, default parameters, function expressions, and advanced type/shape validation remain unimplemented.

### Test Result
- `npm.cmd test` passed 152 tests.
- `node src/cli.js run examples/arrays.bn` printed `Risat`, `Script`, `2`.
- `node src/cli.js run examples/objects.bn` printed `Risat`, `Dhaka`, `Sayed`, `BN`.

### Recommended Next Task
- Stage 10 Composite Data Review

---

## Day 5 - 2026-06-08 (Assignments Stage 8 and While Stage 9)

### Completed: Assignment Expressions and While Loops
- Added parser support for `AssignmentExpression` with `=`, `+=`, `-=`, `*=`, and `/=`.
- Added parser support for `jotokkhon` while loops.
- Added AST factories for `AssignmentExpression` and `WhileStatement`.
- Added semantic analysis for assignment targets, mutable variable reassignment, constant reassignment errors, undeclared assignment targets, and while-loop body analysis.
- Added JavaScript generation for assignment expressions and `while` statements.
- Added assignments and while examples plus integration fixtures.
- Updated public documentation and local alpha release notes for Stage 8 and Stage 9.

### Tests Added
- Parser coverage for simple assignment, compound assignment, assignment precedence, invalid assignment targets, while loop parsing, while loop bodies, and missing while blocks.
- Analyzer coverage for assignment to `dhori`, assignment to undeclared variables, assignment to `sthir`, reading previous values, valid while loops, outer variable resolution, assignment inside while, and undeclared condition variables.
- Generator coverage for simple assignments, compound assignments, complete assignment programs, while output, and complete while counter programs.
- Integration coverage for `tests/integration/assignments.bn` and `tests/integration/while.bn`.

### Files Changed
- `src/ast.js`
- `src/parser.js`
- `src/analyzer.js`
- `src/generator.js`
- `tests/parser.test.js`
- `tests/analyzer.test.js`
- `tests/generator.test.js`
- `tests/stage8-9.integration.test.js`
- `tests/integration/assignments.bn`
- `tests/integration/while.bn`
- `examples/assignments.bn`
- `examples/while.bn`
- `examples/README.md`
- `README.md`
- `docs/getting-started.md`
- `docs/language-spec.md`
- `docs/compiler-architecture.md`
- `RELEASE_NOTES_v0.1.0_ALPHA.md`
- `CHANGELOG.md`

### Known Issues
- Counted `bar` loops, for-each loops, arrays, objects, imports/exports, async/await, member access, indexing, default parameters, function expressions, and package publishing remain unimplemented.
- Assignment targets are limited to identifiers in this alpha compiler.

### Test Result
- `npm.cmd test` passed 125 tests.
- `node src/cli.js run examples/assignments.bn` printed `5`.
- `node src/cli.js run examples/while.bn` printed `0`, `1`, `2`.

### Recommended Next Task
- Stage 8/9 Assignments and While Review

---

## Day 4 - 2026-06-05 (Functions Stage 7)

### Completed: Function Support
- Added parser support for `kaj` function declarations, positional parameters, `ferot` return statements, and call expressions.
- Added AST factories for `FunctionDeclaration`, parameters, `ReturnStatement`, and `CallExpression`.
- Added semantic analysis for function declarations, function scopes, parameter declarations, duplicate parameters, return placement, and call callee resolution.
- Added JavaScript generation for `function`, `return`, and direct function calls.
- Added function examples and integration fixtures.
- Updated public documentation for the newly supported function subset.

### Tests Added
- Parser coverage for function declarations, multiple parameters, returns, calls, and nested function bodies.
- Analyzer coverage for valid functions, valid calls, return placement, duplicate parameters, parameter resolution, and use-before-declaration calls.
- Generator coverage for function declarations, returns, calls, and a complete function program.
- Integration coverage for `tests/integration/functions.bn`.

### Files Changed
- `src/ast.js`
- `src/parser.js`
- `src/scope.js`
- `src/analyzer.js`
- `src/generator.js`
- `tests/parser.test.js`
- `tests/analyzer.test.js`
- `tests/generator.test.js`
- `tests/functions.integration.test.js`
- `tests/integration/functions.bn`
- `examples/functions.bn`
- `README.md`
- `docs/getting-started.md`
- `docs/language-spec.md`
- `CHANGELOG.md`
- `NEXT_TASK.md`

### Known Issues
- Loops, arrays, objects, imports/exports, async/await, member access, assignments, default parameters, function expressions, and package publishing remain unimplemented.
- Function declarations are validated in source order, so calls before declaration are reported as use-before-declaration.

### Test Result
- `npm.cmd test` passed 103 tests.
- `node src/cli.js check examples/functions.bn` passed.
- `node src/cli.js build examples/functions.bn` passed.
- `node src/cli.js run examples/functions.bn` printed `Hello Risat`.

### Recommended Next Task
- Stage 7 Functions Review

---

## Day 3 - 2026-06-04 (Public Release Preparation)

### Completed: Public Release Preparation
- Archived non-public project-management, AI workflow, and architecture review files under `private-notes/`.
- Added `.gitignore` rules for dependencies, logs, temporary files, private notes, generated example outputs, environment files, OS files, and coverage output.
- Added MIT License.
- Rewrote `README.md` for public release clarity, GitHub discoverability, developer adoption, installation, examples, CLI usage, roadmap, and contribution guidance.
- Improved getting started and CLI documentation to emphasize the implemented alpha subset.
- Added alpha-scope notices to the language specification, compiler architecture, and runtime design documents.
- Added `examples/README.md` and `examples/logic.bn`.
- Added `RELEASE_NOTES_v0.1.0_ALPHA.md`.
- Added GitHub SEO helper files: `GITHUB_DESCRIPTION.md` and `GITHUB_TOPICS.md`.
- Updated `package.json` with alpha semver, package metadata, license, bin, exports, engines, keywords, and publish file allowlist.

### Files Archived
- `AGENTS.md` -> `private-notes/AGENTS.md`
- `PROJECT_STATUS.md` -> `private-notes/PROJECT_STATUS.md`
- `TASKS.md` -> `private-notes/TASKS.md`
- `DECISIONS.md` -> `private-notes/DECISIONS.md`
- `NEXT_TASK.md` -> `private-notes/NEXT_TASK.md`
- `ARCHITECTURE_PATCH_REPORT.md` -> `private-notes/ARCHITECTURE_PATCH_REPORT.md`
- `architecture_review.md` -> `private-notes/architecture_review.md`

### Test Result
- `npm.cmd test` passed 87 tests.
- `node src/cli.js check examples/logic.bn` passed.
- `node src/cli.js check examples/hello.bn` passed.

### Known Issues
- The working folder used for release preparation did not contain a `.git` directory, so Git status, commit, tag, push, and release commands must be run from the actual repository checkout.
- v0.1.0 alpha still supports only the current compiler subset documented in `README.md`.

### Recommended Next Task
- Review `RELEASE_READINESS_REPORT.md`, then run the manual publish commands from the real Git repository checkout.

---

## Day 3 - 2026-06-04 (v0.1 Alpha Stabilization)

### Completed: Alpha Stabilization Preparation
- Added CLI stabilization coverage for `run`, compile errors during `run`, invalid commands, and missing files.
- Added fixture-based integration tests under `tests/integration/`.
- Added fixture programs for hello, variables, if/else, and semantic-error cases.
- Added runnable examples under `examples/`.
- Added getting started and CLI reference documentation.
- Added README documentation covering what BN Script is, local run instructions, example code, supported syntax, and current limitations.

### Tests Added
- CLI `bn run` success
- CLI `bn run` compile error
- CLI invalid command
- CLI missing file
- Integration compile for `hello.bn`
- Integration compile for `variables.bn`
- Integration compile for `if.bn`
- Integration semantic diagnostics for `semantic-error.bn`

### Docs Added
- `README.md`
- `docs/getting-started.md`
- `docs/cli.md`
- `examples/hello.bn`
- `examples/variables.bn`
- `examples/if.bn`

### Files Changed
- `README.md`
- `docs/getting-started.md`
- `docs/cli.md`
- `examples/hello.bn`
- `examples/variables.bn`
- `examples/if.bn`
- `tests/cli.test.js`
- `tests/integration/hello.bn`
- `tests/integration/variables.bn`
- `tests/integration/if.bn`
- `tests/integration/semantic-error.bn`
- `tests/integration/integration.test.js`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `NEXT_TASK.md`

### Known Issues
- v0.1 alpha documentation and fixtures intentionally cover only the currently implemented parser/generator subset.
- Loops, functions, imports, exports, assignment expressions, arrays, objects, calls, async/await syntax, package publishing, VS Code extension, LSP, and REPL remain unimplemented.
- Runtime AI helpers and runtime global utility helper wiring remain future work.

### Test Result
- `npm.cmd test` passed 87 tests.

### Recommended Next Task
- v0.1 Alpha Review

---

## Day 3 - 2026-06-04 (CLI Stage 6)

### Completed: Compiler Pipeline and CLI Implementation (Stage 6)
- Created `src/compiler.js` with the Lexer -> Parser -> Analyzer -> Generator pipeline.
- `compile(source, options)` now returns `{ ast, js, diagnostics }`.
- Created `src/cli.js` with `check`, `build`, and `run` command handlers.
- `check` parses and validates BN Script files and prints success or formatted errors.
- `build` compiles BN Script files and writes generated `.js` output next to the input file.
- `run` compiles BN Script files and executes generated JavaScript from a temporary module file.
- CLI error handling prints formatted ParseError, SemanticError, and RuntimeError output when formatting is available.

### Tests Added
- Compile success
- Check success
- Build success
- Generated JS file exists and contains output
- Compile parse error
- Semantic error

### Files Changed
- `src/compiler.js`
- `src/cli.js`
- `tests/cli.test.js`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `NEXT_TASK.md`

### Known Issues
- CLI supports only `check`, `build`, and `run`.
- Package publishing, VS Code extension, LSP, and REPL remain unimplemented.
- CLI run is limited by the currently supported parser/generator subset.

### Test Result
- `npm.cmd test` passed 79 tests.

### Recommended Next Task
- CLI Review

---

## Day 3 - 2026-06-04 (Runtime Stage 5)

### Completed: Runtime Implementation (Stage 5)
- Created `src/runtime/errors.js` with `BNRuntimeError`.
- Created `src/runtime/fetch.js` with `__bn_fetch(url, options = {})`, native fetch support, timeout handling, auto JSON parsing, text fallback, and runtime error wrapping.
- Created `src/runtime/file.js` with `__bn_file.read`, `write`, `append`, `exists`, `delete`, `list`, `readJSON`, and `writeJSON` using Node.js built-in modules.
- Created `src/runtime/env.js` with `__bn_env(name, defaultValue)`.
- Created `src/runtime/wait.js` with promise-based `__bn_wait(ms)`, invalid value rejection, and a 300000ms max wait.
- Created `src/runtime/index.js` exporting `__bn_fetch`, `__bn_file`, `__bn_env`, `__bn_wait`, and `BNRuntimeError`.

### Tests Added
- Environment variable existing/default lookup
- Wait success and invalid wait values
- File write, read, append, exists, delete, and list
- JSON read/write helpers
- Mocked fetch JSON parsing and failed-request wrapping

### Files Changed
- `src/runtime/errors.js`
- `src/runtime/fetch.js`
- `src/runtime/file.js`
- `src/runtime/env.js`
- `src/runtime/wait.js`
- `src/runtime/index.js`
- `tests/runtime.test.js`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `NEXT_TASK.md`

### Known Issues
- Runtime AI helper and global utility helpers are not implemented yet.
- CLI, compiler commands, and package publishing remain unimplemented.
- Network tests use mocked fetch and do not verify live internet behavior.

### Test Result
- `npm.cmd test` passed 73 tests.

### Recommended Next Task
- Runtime Review

---

## Day 3 - 2026-06-04 (Generator Stage 4)

### Completed: JavaScript Generator Implementation (Stage 4)
- Created `src/generator.js` with a tree-walking JavaScript generator and two-space emitter.
- Implemented generation for Program, VarDeclaration, ConstDeclaration, PrintStatement, ExpressionStatement, IfStatement, BlockStatement, Identifier, NumberLiteral, StringLiteral, BooleanLiteral, NullLiteral, UnaryExpression, and BinaryExpression.
- Added translation rules for `dhori` -> `let`, `sthir` -> `const`, `dekhi` -> `console.log`, `sotti`/`mittha`/`khali`, logical operators, unary `na`, and strict equality output for `==` / `!=`.
- Added precedence-aware expression formatting for unary and binary expressions.
- Added `tests/generator.test.js` using the lexer -> parser -> analyzer -> generator path.

### Tests Added
- Declaration generation
- Print generation
- If generation
- Nested blocks
- Binary operators
- Logical operators
- Unary operators
- Complete mini-program generation

### Files Changed
- `src/generator.js`
- `tests/generator.test.js`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `NEXT_TASK.md`

### Known Issues
- Generator Stage 4 intentionally supports only the current parser/analyzer subset.
- Runtime and CLI remain unimplemented.
- String interpolation is not expanded yet because Parser Stage 2 still treats interpolated strings as plain StringLiteral nodes.

### Test Result
- `npm.cmd test` passed 60 tests.

### Recommended Next Task
- Generator Review

---

## Day 3 - 2026-06-04 (Semantic Analyzer Stage 3)

### Completed: Semantic Analyzer Implementation (Stage 3)
- Created `src/scope.js` with global and block scope symbol tracking.
- Created `src/analyzer.js` with AST traversal, SemanticError collection, and semantic metadata annotations.
- Implemented symbol tracking for variables and constants.
- Implemented semantic checks for duplicate declarations, use before declaration, const reassignment, top-level `ferot`, `bekkhon` outside loops, and `cholo` outside loops.
- Added `tests/analyzer.test.js` with coverage for valid declaration, valid nested scope, duplicate variable, use before declaration, const reassignment, child-scope shadowing, top-level return, break outside loop, and continue outside loop.

### Bug Fixes
- Fixed analyzer assignment-target resolution so manually constructed assignment AST nodes initialize identifier semantic metadata before resolution.

### Files Changed
- `src/scope.js`
- `src/analyzer.js`
- `tests/analyzer.test.js`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `NEXT_TASK.md`

### Known Issues
- Parser Stage 2 still does not emit assignment, return, break, continue, loop, or function nodes; analyzer support for those checks is ready for future parser stages and direct AST tests.
- JavaScript generator, runtime, and CLI remain unimplemented.

### Test Result
- `npm.cmd test` passed 52 tests.

### Recommended Next Task
- Semantic Analyzer Review

---

## Day 3 - 2026-06-04 (Parser Review Fixes)

### Completed: Parser Review Fixes
- Added parser tests for exponent associativity, else-if chains, deeply nested grouped expressions, and parser error aggregation/recovery.
- Found a parser recovery bug where leftover expression tokens from a malformed statement could be parsed as a phantom expression statement.
- Fixed parser synchronization so recoverable ParseError handling discards the rest of the broken statement before resuming.

### Files Changed
- `src/parser.js`
- `tests/parser.test.js`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `NEXT_TASK.md`

### Known Issues
- Parser Stage 2 remains intentionally limited to the approved parser subset.
- Semantic analysis, JavaScript generation, runtime behavior, and CLI integration are not implemented yet.

### Test Result
- `npm.cmd test` passed 43 tests.

### Recommended Next Task
- Semantic Analyzer Stage 3

---

## Day 3 - 2026-06-04 (Parser Stage 2)

### Completed: Parser Implementation (Stage 2)
- Created `src/ast.js` with plain-object AST factory functions for the assigned parser subset
- Created `src/parser.js` with recursive descent statement parsing
- Implemented precedence climbing for unary and binary expressions
- Supported NEWLINE statement termination and ignored extra blank lines
- Added parser synchronization for recoverable ParseError collection
- Added BNError-based ParseError handling for missing identifiers, missing block braces, and unsupported syntax
- Added `tests/parser.test.js` with coverage for declarations, print, literals, identifiers, binary precedence, grouping, unary expressions, if/else, nested blocks, expression statements, and parser errors

### Files Changed
- `src/ast.js`
- `src/parser.js`
- `tests/parser.test.js`
- `PROJECT_STATUS.md`
- `TASKS.md`
- `CHANGELOG.md`
- `NEXT_TASK.md`

### Known Issues
- Parser Stage 2 intentionally does not support semantic analysis, generator output, runtime behavior, CLI commands, loops, functions, imports, exports, calls, arrays, objects, assignment expressions, or await.

### Test Result
- `npm.cmd test` passed 39 tests.
- Direct `npm test` in PowerShell was blocked by the local execution policy for `npm.ps1`; `npm.cmd test` ran the same package script successfully.

### Recommended Next Task
- Parser Review

---

## Day 1 — 2026-06-03

Project initialized.

---

## Day 3 — 2026-06-04 (Architecture Patch)

### Completed: Lexer Final Cleanup
- Resolved top-level await contradiction in `DECISIONS.md` (now strictly uses TLA, removing legacy IIFE references)
- Resolved automation primitives contradiction in `DECISIONS.md` (strictly documented as global identifiers, not keywords)
- Verified comprehensive numeric edge-case tests (`1_.2`, `1._2`) and fragile keyword map replacement

### Completed: Lexer Implementation (Stage 1)

**Lexer Components** (`src/`):
- Created `src/tokens.js` with all Token Types and Keyword definitions
- Created `src/errors.js` with `BNError` class and compiler-architecture compliant error formatting
- Created `src/lexer.js` with robust fail-fast implementation
- Handled keywords, identifiers, string interpolation tracking, numbers, operators, punctuation, comments
- Setup Node.js native testing via `package.json`

**Lexer Tests** (`tests/lexer.test.js`):
- Validated individual tokens, complex strings with interpolation, keywords, and automation identifiers
- Validated error throwing for unclosed strings, block comments, and invalid characters
- Added tests for malformed numbers (`1.2.3`, `1_`, `123abc`)
- Added tests for string escape sequences
- Added location tracking verification and EOF correctness

**Lexer Bug Fixes**:
- Added strict number validation (rejecting trailing underscores, multiple decimals)
- Unescaping string escape sequences (`\n`, `\t`, etc.)
- Prevented identifiers from immediately following numbers to avoid confusing typos (treated as `LexError`)

### Applied Architecture Review Fixes

**Language Specification** (`docs/language-spec.md`):
- Fixed import syntax contradiction in §3.2
- Removed `ekti` from reserved list (it is actively used)
- Changed automation primitives (`anro`, `faile`, `ai`, `env`, `wait`, `json`) from keywords to global identifiers
- Removed destructuring syntax from §9.4 to simplify v0.1 parser
- Fixed `env()` compilation example in §11.4
- Removed `Assignment` from EBNF Statement list (now handled via `ExpressionStatement`)

**Compiler Architecture** (`docs/compiler-architecture.md`):
- Documented LL(2) requirement for `bar` loops
- Added rules for `{` block vs object literal disambiguation
- Added rule for `dekhi` argument list termination
- Added statement continuation rules for `nahole`, `error`, `sheshe`, and leading operators
- Added `ExpressionStatement` AST node
- Documented that `ferot` at top-level is a `SemanticError`
- Changed top-level await compilation from async IIFE to Top-Level Await (TLA)
- Clarified that string literal lexing emits a single token (parser handles interpolation)
- Clarified semantic analyzer does not modify AST structure

---

## Day 2 — 2026-06-03 (Architecture Phase)

### Completed: Full Language Foundation Architecture

**Language Specification** (`docs/language-spec.md`):
- Defined language philosophy (5 core principles)
- Defined language goals and non-goals
- Defined 23 core keywords (Bangla-transliterated)
- Defined 6 automation keywords (anro, faile, ai, env, wait, json)
- Defined 3 logical operators (ebong, othoba, na)
- Defined data types (Number, String, Boolean, Null, Array, Object)
- Defined string interpolation syntax (${})
- Defined all operators with precedence table
- Defined control flow (jodi/nahole, jotokkhon, bar)
- Defined functions (kaj, ferot, async, default params)
- Defined async/await (abr) with top-level await support
- Defined all automation primitives with examples
- Defined error handling (dhoro/error/sheshe)
- Defined module system (nao/theke/dao)
- Defined standard library globals (len, type, num, str, range, time, exit)
- Wrote complete EBNF grammar
- Created 5 example programs
- Defined versioning roadmap (v0.1 → v1.0)

**Compiler Architecture** (`docs/compiler-architecture.md`):
- Designed 4-stage pipeline: Lexer → Parser → Semantic Analyzer → Generator
- Defined 40+ token types with structure
- Defined lexer algorithm with line/column tracking
- Designed recursive descent parser (LL(1) with precedence climbing)
- Defined statement termination rules (newline-based, Go-style)
- Defined 25+ AST node types with complete structure
- Designed semantic analyzer with scope chain
- Designed JavaScript code generator with emitter utility
- Defined all translation rules (BN Script → JavaScript)
- Designed error reporting system with 4 categories
- Defined error display format with source context
- Designed CLI interface (compile, run, check commands)
- Defined file organization (src/, tests/, docs/, examples/)
- Defined testing strategy (unit per stage + integration fixtures)

**Runtime Design** (`docs/runtime-design.md`):
- Designed __bn_fetch (HTTP with timeout, auto-JSON, error wrapping)
- Designed __bn_file (8 methods: read, write, append, exists, readJSON, writeJSON, list, delete)
- Designed __bn_ai (OpenAI-compatible, API key resolution chain)
- Designed __bn_env (environment variable access with defaults)
- Designed __bn_wait (delay with validation and max limit)
- Designed 7 global utility functions
- Designed BNRuntimeError class with source location injection
- Designed global error handler for uncaught exceptions
- Established zero-dependency policy (Node.js built-ins only)
- Documented security considerations
- Defined runtime testing strategy

### Files Changed
- `docs/language-spec.md` — created (full language specification)
- `docs/compiler-architecture.md` — created (full compiler architecture)
- `docs/runtime-design.md` — created (full runtime design)
- `PROJECT_STATUS.md` — updated
- `TASKS.md` — updated
- `CHANGELOG.md` — updated
- `NEXT_TASK.md` — updated

### Known Issues
- None. Architecture is complete and ready for implementation.

### Design Decisions Made
- `==` compiles to `===` (strict equality only, no loose equality)
- No semicolons — newline-based statement termination (Go-style)
- No parentheses required around if/while conditions (Go-style)
- Logical operators are keywords (ebong, othoba, na) not symbols
- Top-level await supported (compiles to async IIFE)
- Zero npm dependencies for runtime
- Node.js 18+ required (for built-in fetch)
- ES Modules output format
- Runtime helpers prefixed with __bn_ to avoid naming collisions
