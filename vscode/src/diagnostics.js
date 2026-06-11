const { execFile } = require("child_process");
const path = require("path");
const vscode = require("vscode");
const {
  CLI_NOT_FOUND_MESSAGE,
  compilerPathFromCliPath,
  findCliPath,
} = require("./commands");

const DIAGNOSTIC_COLLECTION_NAME = "bnscript";

const CHECK_SCRIPT = `
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const [compilerPath, filePath] = process.argv.slice(1);
const { compile } = await import(pathToFileURL(compilerPath).href);
const source = await readFile(filePath, "utf8");
const result = compile(source, { filename: filePath });

console.log(JSON.stringify({
  diagnostics: result.diagnostics.map((diagnostic) => ({
    category: diagnostic.category,
    code: diagnostic.code,
    column: diagnostic.column,
    line: diagnostic.line,
    message: diagnostic.message,
    name: diagnostic.name,
  })),
}));
`;

function isBnScriptDocument(document) {
  return (
    document?.uri?.scheme === "file" &&
    (document.languageId === "bnscript" ||
      path.extname(document.uri.fsPath).toLowerCase() === ".bn")
  );
}

function runCompilerCheck(compilerPath, filePath) {
  return new Promise((resolve) => {
    execFile(
      "node",
      ["--input-type=module", "-e", CHECK_SCRIPT, compilerPath, filePath],
      {
        cwd: path.dirname(compilerPath),
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error && !stdout) {
          resolve({
            diagnostics: [
              {
                category: "ExtensionError",
                column: 1,
                line: 1,
                message: `BN Script diagnostics failed.\n\n${stderr || error.message}`,
              },
            ],
          });
          return;
        }

        try {
          resolve(JSON.parse(stdout || '{"diagnostics":[]}'));
        } catch (parseError) {
          resolve({
            diagnostics: [
              {
                category: "ExtensionError",
                column: 1,
                line: 1,
                message: `BN Script diagnostics failed to parse compiler output.\n\n${parseError.message}`,
              },
            ],
          });
        }
      }
    );
  });
}

function diagnosticRange(document, diagnostic) {
  const rawLine = Number.isInteger(diagnostic.line) ? diagnostic.line : 1;
  const rawColumn = Number.isInteger(diagnostic.column) ? diagnostic.column : 1;
  const lineIndex = Math.max(0, Math.min(rawLine - 1, document.lineCount - 1));
  const lineText = document.lineAt(lineIndex).text;
  const startColumn = Math.max(0, Math.min(rawColumn - 1, lineText.length));
  const endColumn = Math.min(lineText.length, startColumn + 1);

  return new vscode.Range(
    lineIndex,
    startColumn,
    lineIndex,
    endColumn > startColumn ? endColumn : startColumn + 1
  );
}

function toVsCodeDiagnostic(document, diagnostic) {
  const item = new vscode.Diagnostic(
    diagnosticRange(document, diagnostic),
    diagnostic.message || "BN Script diagnostic",
    vscode.DiagnosticSeverity.Error
  );

  item.source = "BN Script";
  if (diagnostic.code) {
    item.code = diagnostic.code;
  }

  return item;
}

function createExtensionDiagnostic(document, message) {
  return toVsCodeDiagnostic(document, {
    category: "ExtensionError",
    column: 1,
    line: 1,
    message,
  });
}

async function validateDocument(context, collection, document) {
  if (!isBnScriptDocument(document)) {
    return;
  }

  const cliPath = findCliPath(context, document.uri.fsPath);
  const compilerPath = compilerPathFromCliPath(cliPath);
  if (!compilerPath) {
    collection.set(document.uri, [
      createExtensionDiagnostic(document, CLI_NOT_FOUND_MESSAGE),
    ]);
    return;
  }

  const result = await runCompilerCheck(compilerPath, document.uri.fsPath);
  const diagnostics = (result.diagnostics || []).map((diagnostic) =>
    toVsCodeDiagnostic(document, diagnostic)
  );
  collection.set(document.uri, diagnostics);
}

function registerDiagnostics(context) {
  const collection = vscode.languages.createDiagnosticCollection(
    DIAGNOSTIC_COLLECTION_NAME
  );

  context.subscriptions.push(
    collection,
    vscode.workspace.onDidOpenTextDocument((document) => {
      validateDocument(context, collection, document);
    }),
    vscode.workspace.onDidSaveTextDocument((document) => {
      validateDocument(context, collection, document);
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      collection.delete(document.uri);
    })
  );

  for (const document of vscode.workspace.textDocuments) {
    validateDocument(context, collection, document);
  }

  return collection;
}

module.exports = {
  DIAGNOSTIC_COLLECTION_NAME,
  isBnScriptDocument,
  registerDiagnostics,
  validateDocument,
};
