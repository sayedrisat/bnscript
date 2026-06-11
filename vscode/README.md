# BN Script

BN Script is an automation-first programming language that compiles to readable
JavaScript. This VS Code package provides local editor support for `.bn` files.

## Features

- BN Script language id: `bnscript`
- `.bn` file association
- TextMate syntax highlighting
- Keyword autocomplete for Bangla-style keywords and English aliases
- Hover documentation with Bangla/Banglish and English explanations
- Command Palette actions for checking, building, and running the current file
- `BN Script Output` channel for command output
- Line and block comment configuration
- Bracket, quote, and auto-closing pair configuration
- Sample BN Script program under `samples/demo.bn`

## Supported File Extension

- `.bn`

## Screenshots

Screenshot assets are not included yet. Add screenshots here after the extension
is installed in VS Code and the theme coverage is reviewed.

## Autocomplete

The extension registers a lightweight completion provider for `.bn` files. It
suggests Bangla-style BN Script keywords and English aliases, including:

- `dhori`, `sthir`, `dekhi`, `jodi`, `kaj`, `ferot`
- `let`, `const`, `print`, `if`, `function`, `return`
- `amdani`, `roptani`, `dhoro`, `error`, `sheshe`
- `import`, `export`, `try`, `catch`, `finally`
- `async`, `await`, `true`, `false`, `null`

## Hover Documentation

Hovering a supported keyword shows a short BN Script reference entry with:

- Keyword title
- Bangla/Banglish explanation
- English explanation

The autocomplete and hover providers share keyword data from
`src/keywords.js` so the wording stays consistent.

## Using Commands

Open a `.bn` file, then open the Command Palette with `Ctrl+Shift+P` and run:

- `BN Script: Check Current File`
- `BN Script: Build Current File`
- `BN Script: Run Current File`

Command output appears in the `BN Script Output` channel. The output includes
the command that was executed, compiler output, runtime output, success
messages, and errors.

If the active editor is missing or the active file is not a `.bn` file, the
extension shows a bilingual error:

```txt
Bangla:
Eta BN Script file noy.

English:
The active file is not a BN Script file.
```

## Manual Install

This package is not published to the VS Code Marketplace.

For source development:

1. Open VS Code.
2. Open the `bnscript/vscode` folder as an extension development folder.
3. Press `F5` to launch an Extension Development Host.
4. Open a `.bn` file in the development host.

If VS Code does not associate `.bn` files automatically, add this to user or
workspace `settings.json`:

```json
{
  "files.associations": {
    "*.bn": "bnscript"
  }
}
```

## Building VSIX

From the repository root:

```sh
npm install
npm run build:vsix
```

This creates:

```txt
dist/bnscript-0.1.0-alpha.0.vsix
```

The build uses `@vscode/vsce` to run `vsce package`. It does not publish to the
VS Code Marketplace.

## Installing VSIX Manually

After building the `.vsix` file:

1. Open VS Code.
2. Open the Extensions view.
3. Choose `...` from the Extensions view toolbar.
4. Select `Install from VSIX...`.
5. Choose `dist/bnscript-0.1.0-alpha.0.vsix`.

## Development Install

From this repository:

```sh
code vscode
```

Then press `F5` in VS Code. This loads the extension from source without
publishing or packaging it.

## Grammar Coverage

The TextMate grammar highlights:

- Bangla-style keywords and English aliases
- Strings and interpolation markers
- Numbers
- Line and block comments
- Arithmetic, comparison, and assignment operators
- Function declarations and calls
- Imported identifiers
- Exported identifiers
- Runtime helpers: `env`, `fileRead`, `fileWrite`, `wait`, `httpGet`

## Known Limitations

- No language server diagnostics.
- No formatter.
- No snippets.
- No debugger integration.
- Command integration expects the BN Script CLI source to be available from the
  active workspace or local development checkout.
- Not published to the VS Code Marketplace.
