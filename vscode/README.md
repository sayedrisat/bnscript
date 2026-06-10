# BN Script

BN Script is an automation-first programming language that compiles to readable
JavaScript. This VS Code package provides local editor support for `.bn` files.

## Features

- BN Script language id: `bnscript`
- `.bn` file association
- TextMate syntax highlighting
- Line and block comment configuration
- Bracket, quote, and auto-closing pair configuration
- Sample BN Script program under `samples/demo.bn`

## Supported File Extension

- `.bn`

## Screenshots

Screenshot assets are not included yet. Add screenshots here after the extension
is installed in VS Code and the theme coverage is reviewed.

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

- Keywords and keyword-like operators
- Strings and interpolation markers
- Numbers
- Line and block comments
- Arithmetic, comparison, and assignment operators
- Function declarations and calls
- Imported identifiers
- Exported identifiers
- Runtime helpers: `env`, `fileRead`, `fileWrite`, `wait`, `httpGet`

## Known Limitations

- Syntax highlighting only.
- No language server diagnostics.
- No formatter.
- No completion provider.
- No snippets.
- No debugger integration.
- Not published to the VS Code Marketplace.
