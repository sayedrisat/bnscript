# BN Script Language Specification v0.1

> Public alpha note: this document describes the intended BN Script language design.
> The v0.1.0 alpha implementation currently supports declarations, assignment
> expressions, printing, conditionals, `jotokkhon` while loops, range `bar`
> loops, for-each `bar` loops, function declarations, return statements,
> function calls, blocks, primitive literals, array literals, object literals,
> member access, index access, identifiers, grouped expressions, unary
> expressions, and binary expressions.
> Planned sections such as simple repeat loops, modules, async/await,
> file helpers, HTTP, and AI helpers are design targets, not fully compiled
> features yet.

> **Status:** Draft — Architecture Design Phase
> **Target Runtime:** Node.js (JavaScript output)
> **File Extension:** `.bn`

---

## 1. Language Philosophy

BN Script is designed around five core principles:

1. **Automation First** — Every language feature is evaluated through the lens of "does this make automation easier?" If a feature doesn't serve automation, scripting, or workflow orchestration, it doesn't belong in v1.

2. **Radical Simplicity** — A developer should be able to read BN Script and understand it in minutes, not hours. No complex type systems, no generics, no lifetime annotations. The language should feel like writing instructions for a human assistant.

3. **Batteries Included** — HTTP requests, file I/O, JSON handling, environment variables, and AI model calls are first-class operations with dedicated syntax, not library imports.

4. **Fail Loudly, Recover Gracefully** — Every operation that can fail (network, file, AI) must have clear error semantics. The language encourages explicit error handling without boilerplate.

5. **JavaScript Escape Hatch** — BN Script compiles to readable JavaScript. When you need raw JS power, you can drop down to it. The generated code should be human-readable, not minified noise.

---

## 2. Language Goals

### What BN Script IS:
- A scripting language for automation tasks
- A language that makes API calls trivial
- A language with built-in AI model integration
- A language where file operations are first-class
- A thin, readable layer over JavaScript

### What BN Script is NOT:
- A general-purpose systems language
- A TypeScript replacement
- A frontend framework language
- A language for building compilers or databases
- A language with a complex type system

### Target Use Cases:
1. Web scraping and data extraction
2. API orchestration (chaining multiple API calls)
3. File processing (CSV, JSON, text transformation)
4. AI-powered workflows (prompt → process → output)
5. DevOps automation (deploy scripts, health checks)
6. Scheduled task scripts (cron-style automation)

---

## 3. Program Structure

A BN Script program is a sequence of top-level statements executed from top to bottom. There is no `main()` function requirement.

```
// This is a complete BN Script program
dhori name = "BN Script"
dekhi name
```

### 3.1 Comments

```
// Single-line comment

/*
  Multi-line comment
  Spans multiple lines
*/
```

### 3.2 File Structure Convention

```
// 1. Imports (if any)
nao { floor, ceil } theke "math"

// 2. Configuration / constants
dhori API_KEY = env("OPENAI_KEY")

// 3. Function definitions
kaj fetchUser(id) {
    // ...
}

// 4. Main logic
dhori user = fetchUser(42)
dekhi user
```

---

## 4. Keywords

BN Script uses Bangla-transliterated keywords that map to clear programming concepts. Every keyword is chosen for brevity, memorability, and unambiguous meaning.

### 4.1 Core Keywords

| Keyword     | Meaning               | JS Equivalent              |
|-------------|------------------------|-----------------------------|
| `dhori`     | declare variable       | `let`                       |
| `sthir`     | declare constant       | `const`                     |
| `dekhi`     | print / log            | `console.log()`             |
| `jodi`      | if                     | `if`                        |
| `nahole`    | else                   | `else`                      |
| `bar`       | loop                   | `for` / `for...of`          |
| `jotokkhon` | while                  | `while`                     |
| `kaj`       | function               | `function`                  |
| `ferot`     | return                 | `return`                    |
| `sotti`     | true                   | `true`                      |
| `mittha`    | false                  | `false`                     |
| `khali`     | null                   | `null`                      |
| `nao`       | import                 | `import`                    |
| `theke`     | range separator / from | `for` range / `from`        |
| `dao`       | export                 | `export`                    |
| `bekkhon`   | break                  | `break`                     |
| `cholo`     | continue               | `continue`                  |
| `dhoro`     | try                    | `try`                       |
| `error`     | catch                  | `catch`                     |
| `sheshe`    | finally                | `finally`                   |
| `abr`       | await                  | `await`                     |
| `async`     | async function         | `async`                     |

### 4.2 Automation Primitives (Built-in Globals)

Note: `anro`, `faile`, `ai`, `env`, `wait`, and `json` are **not** keywords. They are pre-declared global identifiers. See Section 11 for details on how they operate.

### 4.3 Reserved for Future Use

```
type, interface, class, new, shob, map, filter, protibar
```

These words are reserved and will cause a compiler error if used as identifiers. This ensures forward compatibility.

---

## 5. Data Types

BN Script has a small, practical type system. Types are inferred at compile time where possible.

### 5.1 Primitive Types

| Type     | Examples                        | JS Mapping     |
|----------|---------------------------------|----------------|
| Number   | `42`, `3.14`, `-7`, `1_000`     | `number`       |
| String   | `"hello"`, `'world'`            | `string`       |
| Boolean  | `sotti`, `mittha`               | `boolean`      |
| Null     | `khali`                         | `null`         |

### 5.2 Composite Types

The current alpha supports array and object literals, including nested arrays
and nested objects.

| Type     | Syntax                          | JS Mapping     |
|----------|---------------------------------|----------------|
| Array    | `[1, 2, 3]`                     | `Array`        |
| Object   | `{ name: "Risat", age: 25 }`   | `Object`       |

### 5.3 String Interpolation

Strings support template-literal-style interpolation using `${}`:

```
dhori name = "Risat"
dhori greeting = "Hello, ${name}!"
dekhi greeting  // "Hello, Risat!"
```

All strings with `${}` compile to JavaScript template literals (backticks). Strings without interpolation compile to regular quoted strings.

### 5.4 Number Separators

Numbers can use underscores for readability:

```
dhori population = 1_000_000
dhori pi = 3.141_592
```

---

## 6. Variables and Constants

### 6.1 Variable Declaration

```
dhori x = 10          // mutable
dhori name = "Risat"  // mutable
```

Compiles to:
```javascript
let x = 10;
let name = "Risat";
```

### 6.2 Constant Declaration

```
sthir PI = 3.14159
sthir API_URL = "https://api.example.com"
```

Compiles to:
```javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";
```

### 6.3 Assignment

The current alpha supports identifier, member, and index assignment targets.

```
dhori x = 10
x = 20              // reassignment
x = x + 5           // compound expression
x += 1              // add and assign
x -= 1              // subtract and assign
x *= 2              // multiply and assign
x /= 2              // divide and assign
user.name = "Sayed" // member assignment
names[0] = "Updated" // index assignment
```

Compiles to:
```javascript
let x = 10;
x = 20;
x = x + 5;
x += 1;
x -= 1;
x *= 2;
x /= 2;
user.name = "Sayed";
names[0] = "Updated";
```

### 6.4 Identifier Rules

- Must start with a letter or underscore: `a-z`, `A-Z`, `_`
- Can contain letters, digits, and underscores: `a-z`, `A-Z`, `0-9`, `_`
- Case-sensitive: `name` and `Name` are different identifiers
- Cannot be a keyword
- Cannot start with a digit

---

## 7. Operators

### 7.1 Arithmetic Operators

| Operator | Meaning        | Example     |
|----------|---------------|-------------|
| `+`      | Addition       | `5 + 3`     |
| `-`      | Subtraction    | `5 - 3`     |
| `*`      | Multiplication | `5 * 3`     |
| `/`      | Division       | `10 / 3`    |
| `%`      | Modulo         | `10 % 3`    |
| `**`     | Exponent       | `2 ** 10`   |

### 7.2 Comparison Operators

| Operator | Meaning                | Example       |
|----------|------------------------|---------------|
| `==`     | Equal                  | `x == 5`      |
| `!=`     | Not equal              | `x != 5`      |
| `>`      | Greater than           | `x > 5`       |
| `<`      | Less than              | `x < 5`       |
| `>=`     | Greater than or equal  | `x >= 5`      |
| `<=`     | Less than or equal     | `x <= 5`      |

**Important Design Decision:** `==` in BN Script compiles to `===` in JavaScript (strict equality). There is no loose equality operator. This prevents an entire class of bugs.

### 7.3 Logical Operators

| Operator | Meaning     | Example               |
|----------|-------------|-----------------------|
| `ebong`  | Logical AND | `x > 0 ebong x < 10` |
| `othoba` | Logical OR  | `x == 0 othoba y == 0`|
| `na`     | Logical NOT | `na sotti`            |

These compile to `&&`, `||`, and `!` respectively.

### 7.4 Assignment Operators

| Operator | Meaning              | Example    |
|----------|----------------------|------------|
| `=`      | Assign               | `x = 5`    |
| `+=`     | Add and assign       | `x += 5`   |
| `-=`     | Subtract and assign  | `x -= 5`   |
| `*=`     | Multiply and assign  | `x *= 5`   |
| `/=`     | Divide and assign    | `x /= 5`   |

### 7.5 Operator Precedence (Highest to Lowest)

1. `()` — Grouping
2. `na` — Unary NOT
3. `**` — Exponentiation
4. `*`, `/`, `%` — Multiplicative
5. `+`, `-` — Additive
6. `>`, `<`, `>=`, `<=` — Comparison
7. `==`, `!=` — Equality
8. `ebong` — Logical AND
9. `othoba` — Logical OR
10. `=`, `+=`, `-=`, `*=`, `/=` — Assignment

---

## 8. Control Flow

### 8.1 If / Else

```
jodi age >= 18 {
    dekhi "Adult"
} nahole {
    dekhi "Minor"
}
```

Chained conditions:

```
jodi score >= 90 {
    dekhi "A"
} nahole jodi score >= 80 {
    dekhi "B"
} nahole jodi score >= 70 {
    dekhi "C"
} nahole {
    dekhi "F"
}
```

**No parentheses required around the condition.** The `{` signals the start of the block. This is similar to Go's approach.

### 8.2 While Loop

The current alpha supports `jotokkhon` while loops.

```
dhori count = 0
jotokkhon count < 10 {
    dekhi count
    count += 1
}
```

### 8.3 Range For Loop

The current alpha supports range `bar` loops with an iterator variable:

```
bar i = 0 theke 10 {
    dekhi i
}
```

This compiles to:
```javascript
for (let i = 0; i < 10; i++) {
    console.log(i);
}
```

The end expression is exclusive, matching the generated JavaScript comparison
`i < end`. Simple repeat loops such as `bar 5 { ... }` remain future work.

### 8.4 For-Each Loop (over arrays)

The current alpha supports for-each loops over iterable expressions. The
iterable can be an identifier, member access, index access, or function call
result.

```
dhori fruits = ["apple", "banana", "mango"]
bar item ekti fruits {
    dekhi item
}
```

Compiles to:
```javascript
const fruits = ["apple", "banana", "mango"];
for (const item of fruits) {
    console.log(item);
}
```

### 8.5 Break and Continue

```
bar i = 0 theke 100 {
    jodi i == 50 {
        bekkhon   // break out of loop
    }
    jodi i % 2 == 0 {
        cholo     // skip to next iteration
    }
    dekhi i
}
```

---

## 9. Functions

Implementation note: the current alpha supports named `kaj` declarations,
positional parameters, `ferot` statements inside function bodies, and direct
function calls. Default parameters, function expressions, arrow functions,
methods, and async functions remain future work.

### 9.1 Function Declaration

```
kaj greet(name) {
    ferot "Hello, ${name}!"
}
```

Compiles to:
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

### 9.2 Function Calls

```
dhori message = greet("Risat")
dekhi message
```

### 9.3 Default Parameters (Future)

Default parameters are part of the language design but are not implemented in
the current alpha compiler.

```
kaj greet(name, prefix = "Hello") {
    ferot "${prefix}, ${name}!"
}

dekhi greet("Risat")           // "Hello, Risat!"
dekhi greet("Risat", "Hi")     // "Hi, Risat!"
```

### 9.4 Arrow-Style Short Functions (Future v0.3)

Reserved for future implementation:
```
// Not yet supported
dhori double = (x) => x * 2
```

---

## 10. Async / Await

All automation operations (HTTP, file, AI) are async. BN Script uses `abr` for await.

### 10.1 Async Functions

```
async kaj fetchData(url) {
    dhori response = abr anro(url)
    ferot response
}
```

### 10.2 Top-Level Await

BN Script supports top-level `abr` — no need to wrap everything in an async function:

```
dhori data = abr anro("https://api.example.com/users")
dekhi data
```

This compiles to an async IIFE wrapper in the generated JavaScript:
```javascript
(async () => {
    const data = await fetch("https://api.example.com/users").then(r => r.json());
    console.log(data);
})();
```

---

## 11. Built-In Automation Primitives

These are the core differentiators of BN Script. They compile to JavaScript library calls with proper error handling baked in.

### 11.1 HTTP Requests — `anro`

```
// GET request
dhori users = abr anro("https://api.example.com/users")

// POST request
dhori result = abr anro("https://api.example.com/users", {
    method: "POST",
    body: { name: "Risat", email: "risat@example.com" }
})

// With headers
dhori data = abr anro("https://api.example.com/data", {
    method: "GET",
    headers: { Authorization: "Bearer ${token}" }
})
```

`anro` compiles to `fetch()` with automatic JSON parsing, error handling, and timeout support.

### 11.2 File Operations — `faile`

```
// Read a file
dhori content = abr faile.read("data.txt")

// Write to a file
abr faile.write("output.txt", "Hello, World!")

// Append to a file
abr faile.append("log.txt", "New entry\n")

// Check if file exists
dhori exists = abr faile.exists("config.json")

// Read JSON file
dhori config = abr faile.readJSON("config.json")

// Write JSON file
abr faile.writeJSON("output.json", data)

// List directory
dhori files = abr faile.list("./data/")

// Delete file
abr faile.delete("temp.txt")
```

### 11.3 AI Integration — `ai`

```
// Simple AI call
dhori response = abr ai.ask("Summarize this text: ${text}")

// With model specification
dhori response = abr ai.ask("Translate to Bengali: ${text}", {
    model: "gpt-4",
    temperature: 0.7
})

// With system prompt
dhori response = abr ai.ask("What is 2+2?", {
    system: "You are a math tutor. Show your work.",
    model: "gpt-4"
})
```

### 11.4 Environment Variables — `env`

```
dhori apiKey = env("API_KEY")
dhori port = env("PORT", "3000")  // with default value
```

Compiles to:
```javascript
const apiKey = __bn_env("API_KEY");
const port = __bn_env("PORT", "3000");
```

### 11.5 Delay / Wait — `wait`

```
dekhi "Starting..."
abr wait(2000)           // wait 2 seconds (milliseconds)
dekhi "Done waiting!"
```

Compiles to:
```javascript
console.log("Starting...");
await new Promise(resolve => setTimeout(resolve, 2000));
console.log("Done waiting!");
```

### 11.6 JSON Operations — `json`

```
dhori text = '{"name": "Risat"}'
dhori obj = json.parse(text)

dhori str = json.stringify(obj)
dhori pretty = json.stringify(obj, 2)   // with indentation
```

---

## 12. Error Handling

### 12.1 Try / Catch / Finally

```
dhoro {
    dhori data = abr anro("https://api.example.com/data")
    dekhi data
} error e {
    dekhi "Error: ${e.message}"
} sheshe {
    dekhi "Cleanup done"
}
```

Compiles to:
```javascript
try {
    const data = await fetch("https://api.example.com/data").then(r => r.json());
    console.log(data);
} catch (e) {
    console.log(`Error: ${e.message}`);
} finally {
    console.log("Cleanup done");
}
```

### 12.2 Automatic Error Context

The compiler injects source location metadata into automation operations so runtime errors include the BN Script file and line number, not the generated JavaScript line.

---

## 13. Modules

### 13.1 Importing

```
// Import from another BN Script file
nao { greet, farewell } theke "./utils.bn"

// Import everything
nao helpers theke "./helpers.bn"
helpers.greet("Risat")
```

### 13.2 Exporting

```
// Named export
dao kaj greet(name) {
    ferot "Hello, ${name}!"
}

// Export variable
dao dhori VERSION = "1.0.0"
```

### 13.3 Import Compilation

BN Script imports compile to ES Module `import` statements:

```javascript
import { greet, farewell } from "./utils.js";
```

The compiler automatically maps `.bn` → `.js` in import paths.

---

## 14. Standard Library (Built-in Globals)

These are available without imports:

| Function         | Purpose                                    |
|------------------|--------------------------------------------|
| `dekhi(...args)` | Print to console                           |
| `env(key, def)`  | Read environment variable                  |
| `len(x)`         | Get length of string/array                 |
| `type(x)`        | Get type as string                         |
| `num(x)`         | Convert to number                          |
| `str(x)`         | Convert to string                          |
| `range(n)`       | Generate array [0, 1, ..., n-1]            |
| `time()`         | Current timestamp in milliseconds          |
| `exit(code)`     | Exit process with code                     |
| `anro`           | HTTP request helper                        |
| `faile`          | File operations helper                     |
| `ai`             | AI model helper                            |
| `wait`           | Sleep / delay helper                       |
| `json`           | JSON parse / stringify helper              |

---

## 15. Operator and Syntax Summary Table

| BN Script         | JavaScript Output           |
|--------------------|-----------------------------|
| `dhori x = 5`     | `let x = 5;`               |
| `sthir X = 5`     | `const X = 5;`             |
| `x = x + 1`       | `x = x + 1;`              |
| `x += 1`          | `x += 1;`                 |
| `dhori a = [1,2]` | `let a = [1,2];`          |
| `dhori u = { name: "Risat" }` | `let u = { name: "Risat" };` |
| `u.name`          | `u.name`                  |
| `a[0]`            | `a[0]`                    |
| `dekhi x`         | `console.log(x);`          |
| `jodi x > 0 { }` | `if (x > 0) { }`          |
| `nahole { }`      | `else { }`                 |
| `bar i = 0 theke 5 { }` | `for (let i = 0; i < 5; i++) { }` |
| `bar item ekti a { }` | `for (const item of a) { }` |
| `jotokkhon c { }` | `while (c) { }`           |
| `kaj f(x) { }`    | `function f(x) { }`       |
| `ferot x`          | `return x;`               |
| `sotti / mittha`   | `true / false`            |
| `khali`            | `null`                    |
| `ebong`            | `&&`                      |
| `othoba`           | `\|\|`                    |
| `na`               | `!`                       |
| `abr`              | `await`                   |
| `==`               | `===`                     |
| `!=`               | `!==`                     |

---

## 16. Grammar Summary (EBNF-like)

This is a high-level reference for the parser implementer.

```ebnf
Program         = Statement* EOF

Statement       = VarDeclaration
                | ConstDeclaration
                | PrintStatement
                | IfStatement
                | WhileStatement
                | ForLoop
                | ForEachLoop
                | FunctionDecl
                | ReturnStatement
                | BreakStatement
                | ContinueStatement
                | TryCatch
                | ExpressionStatement
                | ImportStatement
                | ExportStatement

VarDeclaration  = "dhori" IDENTIFIER "=" Expression
ConstDeclaration= "sthir" IDENTIFIER "=" Expression
PrintStatement  = "dekhi" ExpressionList
IfStatement     = "jodi" Expression Block ("nahole" "jodi" Expression Block)* ("nahole" Block)?
WhileStatement  = "jotokkhon" Expression Block
ForLoop         = "bar" IDENTIFIER "=" Expression "theke" Expression Block
ForEachLoop     = "bar" IDENTIFIER "ekti" Expression Block
FunctionDecl    = "async"? "kaj" IDENTIFIER "(" ParamList? ")" Block
ReturnStatement = "ferot" Expression?
BreakStatement  = "bekkhon"
ContinueStatement = "cholo"
TryCatch        = "dhoro" Block "error" IDENTIFIER? Block ("sheshe" Block)?
ImportStatement = "nao" (IDENTIFIER | "{" IdentifierList "}") "theke" STRING
ExportStatement = "dao" (VarDeclaration | ConstDeclaration | FunctionDecl)

Expression      = AssignExpr
AssignExpr      = LogicalOr (AssignOp AssignExpr)?
LogicalOr       = LogicalAnd ("othoba" LogicalAnd)*
LogicalAnd      = Equality ("ebong" Equality)*
Equality        = Comparison (("==" | "!=") Comparison)*
Comparison      = Addition ((">" | "<" | ">=" | "<=") Addition)*
Addition        = Multiplication (("+" | "-") Multiplication)*
Multiplication  = Exponent (("*" | "/" | "%") Exponent)*
Exponent        = UnaryExpr ("**" Exponent)?
UnaryExpr       = ("na" | "-") UnaryExpr | PostfixExpr
PostfixExpr     = Primary (Call | MemberAccess | IndexAccess)*
Call            = "(" ArgList? ")"
MemberAccess    = "." IDENTIFIER
IndexAccess     = "[" Expression "]"

Primary         = NUMBER | STRING | "sotti" | "mittha" | "khali"
                | IDENTIFIER
                | "(" Expression ")"
                | ArrayLiteral
                | ObjectLiteral
                | AwaitExpr

AwaitExpr       = "abr" Expression
ArrayLiteral    = "[" (Expression ("," Expression)*)? "]"
ObjectLiteral   = "{" (Property ("," Property)*)? "}"
Property        = (IDENTIFIER | STRING) ":" Expression

Block           = "{" Statement* "}"
AssignOp        = "=" | "+=" | "-=" | "*=" | "/="
ParamList       = Param ("," Param)*
Param           = IDENTIFIER ("=" Expression)?
ArgList         = Expression ("," Expression)*
IdentifierList  = IDENTIFIER ("," IDENTIFIER)*
ExpressionList  = Expression ("," Expression)*
```

---

## 17. Example Programs

### 17.1 Hello World

```
dekhi "Hello, World!"
```

### 17.2 API Data Fetcher

```
sthir API_URL = "https://jsonplaceholder.typicode.com/users"

dhoro {
    dhori users = abr anro(API_URL)
    bar user ekti users {
        dekhi "${user.name} — ${user.email}"
    }
} error e {
    dekhi "Failed to fetch users: ${e.message}"
}
```

### 17.3 File Processor

```
dhori content = abr faile.read("input.csv")
dhori lines = content.split("\n")

dhori results = []
bar line ekti lines {
    dhori parts = line.split(",")
    jodi parts.length > 2 {
        results.push({ name: parts[0], score: num(parts[1]) })
    }
}

abr faile.writeJSON("output.json", results)
dekhi "Processed ${len(results)} records"
```

### 17.4 AI-Powered Script

```
sthir API_KEY = env("OPENAI_KEY")

dhori article = abr faile.read("article.txt")
dhori summary = abr ai.ask("Summarize in 3 bullet points: ${article}", {
    model: "gpt-4",
    temperature: 0.3
})

dekhi summary
abr faile.write("summary.txt", summary)
```

### 17.5 Retry Loop with Delay

```
dhori maxRetries = 3
dhori attempt = 0
dhori success = mittha

jotokkhon attempt < maxRetries ebong na success {
    dhoro {
        dhori data = abr anro("https://unreliable-api.com/data")
        dekhi "Success on attempt ${attempt + 1}"
        success = sotti
    } error e {
        attempt += 1
        dekhi "Attempt ${attempt} failed: ${e.message}"
        jodi attempt < maxRetries {
            abr wait(1000 * attempt)  // exponential-ish backoff
        }
    }
}

jodi na success {
    dekhi "All ${maxRetries} attempts failed."
    exit(1)
}
```

---

## 18. Versioning and Roadmap

| Version | Features                                              |
|---------|-------------------------------------------------------|
| v0.1    | Variables, constants, assignments, print, if/else, while loops, range loops, for-each loops, functions, calls, arrays, objects, member/index access, basic expressions |
| v0.2    | Modules (import/export), richer diagnostics, simple repeat loops |
| v0.3    | HTTP requests, file operations, async/await, error handling |
| v0.4    | AI integration and JSON operations |
| v0.5    | Standard library expansion, package manager integration, REPL, debugging support |
| v1.0    | Stable release, full documentation, editor plugins    |

---

*This document is the single source of truth for BN Script language design. All compiler stages must conform to this specification.*
