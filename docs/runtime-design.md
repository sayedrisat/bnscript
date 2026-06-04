# BN Script Runtime Design v0.1

> Public alpha note: this document describes the intended runtime layer. The
> v0.1.0 alpha includes fetch, file, env, wait, runtime error modules, and the
> runtime index export. AI helpers and global utility injection remain planned.

> **Status:** Draft — Architecture Design Phase
> **Runtime Environment:** Node.js 18+
> **Module Format:** ES Modules

---

## 1. Runtime Overview

The BN Script runtime is a thin JavaScript library that provides the built-in operations used by compiled BN Script programs. When the compiler encounters built-in operations like `anro`, `faile`, `ai`, `env`, and `wait`, it generates calls to runtime helper functions instead of inlining the implementation.

### Why a Separate Runtime?

1. **Compiled code stays small** — Business logic isn't bloated with HTTP client or file system implementations.
2. **Runtime can be updated independently** — Bug fixes and improvements to built-ins don't require recompiling scripts.
3. **Testing is easier** — Runtime functions can be unit tested in isolation.
4. **Mocking is possible** — Users can swap the runtime for testing (e.g., mock AI calls).

### Runtime Import Model

Generated JavaScript files import runtime helpers from a single entry point:

```javascript
import { __bn_fetch, __bn_file, __bn_ai, __bn_env, __bn_wait } from "bnscript/runtime";
```

The compiler only imports the helpers that are actually used in the source file (tree-shakeable).

---

## 2. Runtime Module Structure

```
src/runtime/
├── index.js          # Re-exports all runtime helpers
├── fetch.js          # HTTP request helper (__bn_fetch)
├── file.js           # File operation helpers (__bn_file)
├── ai.js             # AI integration helper (__bn_ai)
├── env.js            # Environment variable helper (__bn_env)
├── wait.js           # Delay/sleep helper (__bn_wait)
├── globals.js        # Global utility functions (len, type, num, str, range, time, exit)
└── errors.js         # Runtime error wrapper (BNRuntimeError)
```

---

## 3. Runtime Helpers Specification

### 3.1 `__bn_fetch(url, options?)` — HTTP Requests

**Maps to BN Script's `anro` keyword.**

#### Behavior
- Wraps Node.js `fetch()` (available in Node 18+)
- Automatically parses JSON responses (Content-Type detection)
- Adds timeout support (default: 30 seconds)
- Wraps errors with clear messages including URL and status code
- Handles non-2xx responses as errors by default

#### Signature
```javascript
async function __bn_fetch(url, options = {}) → any
```

#### Options Object
```javascript
{
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",  // default: "GET"
    headers: { [key]: string },                            // default: {}
    body: any,                                             // auto JSON.stringify if object
    timeout: number                                        // milliseconds, default: 30000
}
```

#### Return Value
- If response Content-Type is `application/json`: returns parsed JSON object
- Otherwise: returns response body as string

#### Error Behavior
```javascript
// On non-2xx status:
throw new BNRuntimeError(
    `HTTP request failed: ${method} ${url} returned status ${status}`,
    { url, method, status, statusText }
);

// On timeout:
throw new BNRuntimeError(
    `HTTP request timed out after ${timeout}ms: ${method} ${url}`,
    { url, method, timeout }
);

// On network error:
throw new BNRuntimeError(
    `HTTP request failed: ${originalError.message}`,
    { url, method, originalError }
);
```

#### Implementation Strategy
```javascript
async function __bn_fetch(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const timeout = options.timeout || 30000;
    const headers = { ...options.headers };
    
    let body = options.body;
    if (body && typeof body === "object") {
        body = JSON.stringify(body);
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new BNRuntimeError(
                `HTTP request failed: ${method} ${url} returned status ${response.status}`,
                { url, method, status: response.status }
            );
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof BNRuntimeError) throw error;
        if (error.name === "AbortError") {
            throw new BNRuntimeError(
                `HTTP request timed out after ${timeout}ms: ${method} ${url}`,
                { url, method, timeout }
            );
        }
        throw new BNRuntimeError(
            `HTTP request failed: ${error.message}`,
            { url, method, originalError: error }
        );
    }
}
```

---

### 3.2 `__bn_file` — File Operations

**Maps to BN Script's `faile` keyword.**

All file operations are async and use Node.js `fs/promises`.

#### Methods

| Method                     | Signature                                      | Description                    |
|----------------------------|-------------------------------------------------|--------------------------------|
| `__bn_file.read(path)`     | `async (path: string) → string`                | Read file as UTF-8 text        |
| `__bn_file.write(path, data)` | `async (path: string, data: string) → void` | Write text to file (overwrite) |
| `__bn_file.append(path, data)` | `async (path: string, data: string) → void`| Append text to file            |
| `__bn_file.exists(path)`   | `async (path: string) → boolean`               | Check if file exists           |
| `__bn_file.readJSON(path)` | `async (path: string) → any`                   | Read and parse JSON file       |
| `__bn_file.writeJSON(path, data, indent?)` | `async (path, data, indent=2) → void` | Write object as JSON   |
| `__bn_file.list(dir)`      | `async (dir: string) → string[]`               | List directory contents        |
| `__bn_file.delete(path)`   | `async (path: string) → void`                  | Delete a file                  |

#### Error Behavior

All file operations wrap errors with context:

```javascript
// File not found:
throw new BNRuntimeError(
    `File not found: "${path}"`,
    { path, operation: "read" }
);

// Permission denied:
throw new BNRuntimeError(
    `Permission denied: cannot ${operation} "${path}"`,
    { path, operation }
);
```

#### Implementation Strategy
```javascript
import { readFile, writeFile, appendFile, access, readdir, unlink } from "fs/promises";
import { existsSync } from "fs";

const __bn_file = {
    async read(path) {
        try {
            return await readFile(path, "utf-8");
        } catch (error) {
            throw new BNRuntimeError(
                `Failed to read file: "${path}" — ${error.message}`,
                { path, operation: "read" }
            );
        }
    },

    async write(path, data) {
        try {
            await writeFile(path, String(data), "utf-8");
        } catch (error) {
            throw new BNRuntimeError(
                `Failed to write file: "${path}" — ${error.message}`,
                { path, operation: "write" }
            );
        }
    },

    async append(path, data) {
        try {
            await appendFile(path, String(data), "utf-8");
        } catch (error) {
            throw new BNRuntimeError(
                `Failed to append to file: "${path}" — ${error.message}`,
                { path, operation: "append" }
            );
        }
    },

    async exists(path) {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    },

    async readJSON(path) {
        const content = await this.read(path);
        try {
            return JSON.parse(content);
        } catch (error) {
            throw new BNRuntimeError(
                `Failed to parse JSON from file: "${path}" — ${error.message}`,
                { path, operation: "readJSON" }
            );
        }
    },

    async writeJSON(path, data, indent = 2) {
        const content = JSON.stringify(data, null, indent);
        await this.write(path, content);
    },

    async list(dir) {
        try {
            return await readdir(dir);
        } catch (error) {
            throw new BNRuntimeError(
                `Failed to list directory: "${dir}" — ${error.message}`,
                { path: dir, operation: "list" }
            );
        }
    },

    async delete(path) {
        try {
            await unlink(path);
        } catch (error) {
            throw new BNRuntimeError(
                `Failed to delete file: "${path}" — ${error.message}`,
                { path, operation: "delete" }
            );
        }
    }
};
```

---

### 3.3 `__bn_ai` — AI Integration

**Maps to BN Script's `ai` keyword.**

#### Methods

| Method                          | Description                              |
|---------------------------------|------------------------------------------|
| `__bn_ai.ask(prompt, options?)` | Send a prompt to an AI model and get response |

#### Options Object
```javascript
{
    model: "gpt-4" | "gpt-3.5-turbo" | string,   // default: "gpt-3.5-turbo"
    system: string,                                 // system prompt
    temperature: number,                            // 0.0 - 2.0, default: 0.7
    maxTokens: number,                              // default: 1000
    apiKey: string                                  // override env API key
}
```

#### API Key Resolution Order
1. `options.apiKey` (passed explicitly)
2. `process.env.OPENAI_API_KEY`
3. `process.env.BN_AI_KEY`
4. Error: "No AI API key configured"

#### Return Value
Returns the AI model's response as a plain string.

#### Implementation Strategy
```javascript
async function ask(prompt, options = {}) {
    const apiKey = options.apiKey
        || process.env.OPENAI_API_KEY
        || process.env.BN_AI_KEY;

    if (!apiKey) {
        throw new BNRuntimeError(
            "No AI API key configured. Set OPENAI_API_KEY or BN_AI_KEY environment variable.",
            { operation: "ai.ask" }
        );
    }

    const model = options.model || "gpt-3.5-turbo";
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 1000;

    const messages = [];
    if (options.system) {
        messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await __bn_fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: { model, messages, temperature, max_tokens: maxTokens }
    });

    if (!response.choices || !response.choices[0]) {
        throw new BNRuntimeError(
            "AI returned an unexpected response format",
            { operation: "ai.ask", response }
        );
    }

    return response.choices[0].message.content;
}

const __bn_ai = { ask };
```

#### Future Extensibility
The `__bn_ai` object is designed to support additional methods:
- `__bn_ai.stream(prompt, options)` — Streaming responses (v0.4)
- `__bn_ai.embed(text, options)` — Text embeddings (v0.5)
- Support for additional providers (Anthropic, Google, local models) via `options.provider`

---

### 3.4 `__bn_env(key, defaultValue?)` — Environment Variables

**Maps to BN Script's `env()` function.**

#### Signature
```javascript
function __bn_env(key, defaultValue) → string | undefined
```

#### Behavior
- Returns `process.env[key]` if set
- Returns `defaultValue` if the variable is not set and a default is provided
- Returns `undefined` if the variable is not set and no default is provided
- Supports `.env` file loading in the future (v0.3)

#### Implementation
```javascript
function __bn_env(key, defaultValue) {
    const value = process.env[key];
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return undefined;
}
```

---

### 3.5 `__bn_wait(ms)` — Delay / Sleep

**Maps to BN Script's `wait()` function.**

#### Signature
```javascript
async function __bn_wait(ms) → void
```

#### Behavior
- Pauses execution for `ms` milliseconds
- Validates that `ms` is a non-negative number
- Maximum wait of 1 hour (3,600,000ms) — prevents accidental infinite waits

#### Implementation
```javascript
async function __bn_wait(ms) {
    if (typeof ms !== "number" || ms < 0) {
        throw new BNRuntimeError(
            `wait() expects a non-negative number, got: ${ms}`,
            { operation: "wait", value: ms }
        );
    }
    const maxWait = 3_600_000; // 1 hour
    if (ms > maxWait) {
        throw new BNRuntimeError(
            `wait() maximum is ${maxWait}ms (1 hour), got: ${ms}`,
            { operation: "wait", value: ms }
        );
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 4. Global Utility Functions

These are available in every BN Script program without import. They are injected into the generated code.

### 4.1 Function Catalog

```javascript
// Get length of string or array
function len(x) {
    if (x == null) return 0;
    if (typeof x === "string" || Array.isArray(x)) return x.length;
    if (typeof x === "object") return Object.keys(x).length;
    throw new BNRuntimeError(`len() cannot get length of ${typeof x}`);
}

// Get type as string
function type(x) {
    if (x === null) return "null";
    if (Array.isArray(x)) return "array";
    return typeof x;
}

// Convert to number
function num(x) {
    const n = Number(x);
    if (isNaN(n)) {
        throw new BNRuntimeError(`num() cannot convert "${x}" to a number`);
    }
    return n;
}

// Convert to string
function str(x) {
    if (x === null || x === undefined) return "";
    if (typeof x === "object") return JSON.stringify(x);
    return String(x);
}

// Generate range array [0, 1, ..., n-1]
function range(n) {
    if (typeof n !== "number" || n < 0) {
        throw new BNRuntimeError(`range() expects a non-negative number, got: ${n}`);
    }
    return Array.from({ length: Math.floor(n) }, (_, i) => i);
}

// Current timestamp in milliseconds
function time() {
    return Date.now();
}

// Exit process
function exit(code = 0) {
    process.exit(code);
}
```

### 4.2 Injection Strategy

The compiler adds global function declarations to the generated output only when they are used. Detection is done during semantic analysis by checking if identifiers like `len`, `type`, `num`, `str`, `range`, `time`, `exit` are referenced.

Option A (v0.1): Inline the function at the top of the generated file.
Option B (later): Import from `bnscript/runtime`.

---

## 5. Runtime Error System

### 5.1 BNRuntimeError Class

```javascript
class BNRuntimeError extends Error {
    constructor(message, context = {}) {
        super(message);
        this.name = "BNRuntimeError";
        this.context = context;         // { url, path, operation, etc. }
        this.bnFile = context.bnFile;   // Source .bn file (injected by compiler)
        this.bnLine = context.bnLine;   // Source line number (injected by compiler)
    }

    format() {
        let output = `\n╔══════════════════════════════════════════╗\n`;
        output += `║  BN Script Runtime Error                ║\n`;
        output += `╚══════════════════════════════════════════╝\n\n`;

        if (this.bnFile) {
            output += `  File: ${this.bnFile}\n`;
        }
        if (this.bnLine) {
            output += `  Line: ${this.bnLine}\n`;
        }
        output += `\n  ${this.message}\n`;

        return output;
    }
}
```

### 5.2 Source Location Injection

The compiler injects source location metadata into runtime calls so that runtime errors can reference the original BN Script file and line:

BN Script:
```
dhori data = abr anro("https://example.com/api")   // line 5 in app.bn
```

Generated JavaScript:
```javascript
const data = await __bn_fetch("https://example.com/api", undefined, { bnFile: "app.bn", bnLine: 5 });
```

Each runtime helper accepts an optional last argument `__bnMeta` containing source location. This is used when constructing `BNRuntimeError` instances.

---

## 6. Global Error Handler

The runtime installs a global uncaught error handler to format runtime errors nicely:

```javascript
process.on("uncaughtException", (error) => {
    if (error instanceof BNRuntimeError) {
        console.error(error.format());
    } else {
        console.error(`\nUnexpected error: ${error.message}\n`);
        console.error(error.stack);
    }
    process.exit(2);
});

process.on("unhandledRejection", (error) => {
    if (error instanceof BNRuntimeError) {
        console.error(error.format());
    } else {
        console.error(`\nUnhandled promise rejection: ${error.message}\n`);
        console.error(error.stack);
    }
    process.exit(2);
});
```

This handler is injected at the top of every generated JavaScript file (or once in the runtime entry point).

---

## 7. Configuration

### 7.1 `bn.config.json` (Future — v0.4)

An optional configuration file for runtime settings:

```json
{
    "ai": {
        "defaultModel": "gpt-4",
        "defaultTemperature": 0.7,
        "timeout": 60000
    },
    "http": {
        "timeout": 30000,
        "retries": 0
    },
    "env": {
        "dotenvPath": ".env"
    }
}
```

For v0.1, all configuration is done via environment variables and function arguments.

---

## 8. Dependency Policy

The runtime uses **zero external npm dependencies** in v0.1. Everything is built on Node.js built-in modules:

| Need              | Solution                           |
|-------------------|------------------------------------|
| HTTP requests     | Node.js `fetch()` (Node 18+)      |
| File operations   | `fs/promises`                      |
| JSON              | Built-in `JSON`                    |
| Environment vars  | `process.env`                      |
| Timers            | `setTimeout`                       |
| AI API calls      | Via `__bn_fetch` (no SDK needed)   |

This means:
- No `axios`, no `node-fetch`, no `dotenv`
- Zero `node_modules` bloat
- Fast install, fast startup
- Maximum compatibility

---

## 9. Security Considerations

### 9.1 File System Access

BN Script file operations have **no sandboxing** in v0.1. The runtime has the same permissions as the Node.js process. This is acceptable because:
- BN Script targets automation (where file access is expected)
- Users run their own scripts (not untrusted code)

**Future (v0.5):** Optional sandbox mode that restricts file operations to a specified directory.

### 9.2 Environment Variables

The `env()` function exposes all environment variables. This is by design for automation use cases. Users should be careful not to log sensitive values.

### 9.3 HTTP Requests

No CORS restrictions (server-side Node.js). The timeout prevents runaway connections.

### 9.4 AI API Keys

API keys are read from environment variables, never hardcoded. The runtime never logs API keys.

---

## 10. Runtime Versioning

The runtime version is tied to the compiler version in v0.1. As the project matures:

| Version | Runtime Changes                                      |
|---------|------------------------------------------------------|
| v0.1    | Core helpers: fetch, file, env, wait, globals        |
| v0.2    | AI integration (`__bn_ai`)                           |
| v0.3    | `.env` file loading, config file support             |
| v0.4    | Streaming AI, retry policies, advanced file ops      |
| v0.5    | Plugin system, custom runtime helpers                |

---

## 11. Testing the Runtime

Each runtime module has its own test file:

```
tests/
├── runtime/
│   ├── fetch.test.js       # Mock HTTP tests
│   ├── file.test.js        # Temp file read/write tests
│   ├── ai.test.js          # Mock API response tests
│   ├── env.test.js         # Environment variable tests
│   ├── wait.test.js        # Timer tests
│   └── globals.test.js     # Utility function tests
```

**Testing approach:**
- `__bn_fetch`: Use Node.js `--experimental-vm-modules` or mock `fetch`
- `__bn_file`: Create temp files, validate contents, clean up
- `__bn_ai`: Mock the HTTP call, validate request structure
- `__bn_env`: Set/unset `process.env` in test setup/teardown
- `__bn_wait`: Validate delay with timestamp checks (tolerance: 50ms)

---

*This document defines the runtime layer of BN Script. The runtime is the bridge between BN Script's high-level automation syntax and the underlying Node.js capabilities.*
