# BN Script Syntax Highlighting

This folder contains lightweight VS Code syntax highlighting assets for BN
Script `.bn` files.

It is syntax support only. It does not provide a language server, debugger,
formatter, snippets, tasks, or package publishing workflow.

## File Association

If VS Code does not automatically detect `.bn` files as BN Script, add this to
your user or workspace `settings.json`:

```json
{
  "files.associations": {
    "*.bn": "bnscript"
  }
}
```

## Files

- `package.json`: minimal VS Code language and grammar contribution metadata.
- `bnscript.tmLanguage.json`: TextMate grammar for BN Script.
- `language-configuration.json`: comments, brackets, and auto-closing pairs.
