const vscode = require("vscode");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { COMMANDS } = require("./commands");
const { registerDiagnostics } = require("./diagnostics");
const { KEYWORDS, getKeyword } = require("./keywords");

const LANGUAGE_SELECTOR = {
  language: "bnscript",
  scheme: "file",
};
const OUTPUT_CHANNEL_NAME = "BN Script Output";

function keywordMarkdown(entry) {
  const markdown = new vscode.MarkdownString();
  markdown.appendMarkdown(`**${entry.title}**\n\n`);
  markdown.appendMarkdown("Bangla:\n");
  markdown.appendText(entry.description_bn);
  markdown.appendMarkdown("\n\nEnglish:\n");
  markdown.appendText(entry.description_en);
  return markdown;
}

function createCompletionItem(entry) {
  const item = new vscode.CompletionItem(
    entry.keyword,
    vscode.CompletionItemKind.Keyword
  );
  item.detail = entry.title;
  item.documentation = keywordMarkdown(entry);
  item.insertText = entry.keyword;
  return item;
}

function bilingualMessage(bn, en) {
  return `Bangla:\n${bn}\n\nEnglish:\n${en}`;
}

function resolveActiveBnFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return {
      error: bilingualMessage(
        "Active editor nei.",
        "No active editor is open."
      ),
    };
  }

  const filePath = editor.document.uri.fsPath;
  if (!filePath || path.extname(filePath).toLowerCase() !== ".bn") {
    return {
      error: bilingualMessage(
        "Eta BN Script file noy.",
        "The active file is not a BN Script file."
      ),
    };
  }

  return { filePath };
}

function findCliPath(context, filePath) {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(filePath)
  );
  const candidates = [
    workspaceFolder?.uri.fsPath,
    path.resolve(context.extensionPath, ".."),
    context.extensionPath,
  ].filter(Boolean);

  for (const root of candidates) {
    const cliPath = path.join(root, "src", "cli.js");
    if (fs.existsSync(cliPath)) {
      return cliPath;
    }
  }

  return null;
}

function runCli(action, filePath, cliPath, outputChannel, commandTitle) {
  return new Promise((resolve) => {
    const args = [cliPath, action, filePath];
    outputChannel.appendLine(`$ node ${args.map((arg) => `"${arg}"`).join(" ")}`);
    outputChannel.appendLine("");

    execFile("node", args, {
      cwd: path.dirname(cliPath),
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (stdout) {
        outputChannel.appendLine(stdout.trimEnd());
      }

      if (stderr) {
        outputChannel.appendLine(stderr.trimEnd());
      }

      if (error) {
        outputChannel.appendLine("");
        outputChannel.appendLine(`${commandTitle} exited with code ${error.code ?? 1}.`);
        resolve({ ok: false, code: error.code ?? 1 });
        return;
      }

      outputChannel.appendLine("");
      outputChannel.appendLine(`${commandTitle} completed with exit code 0.`);
      resolve({ ok: true, code: 0 });
    });
  });
}

function registerBnScriptCommand(context, outputChannel, command) {
  return vscode.commands.registerCommand(command.id, async () => {
    outputChannel.show(true);
    outputChannel.appendLine(`== ${command.title} ==`);

    const activeFile = resolveActiveBnFile();
    if (activeFile.error) {
      outputChannel.appendLine(activeFile.error);
      vscode.window.showErrorMessage(activeFile.error);
      outputChannel.appendLine("");
      return;
    }

    const cliPath = findCliPath(context, activeFile.filePath);
    if (!cliPath) {
      const message = bilingualMessage(
        "BN Script CLI khuje paoa jayni.",
        "Could not find the BN Script CLI."
      );
      outputChannel.appendLine(message);
      vscode.window.showErrorMessage(message);
      outputChannel.appendLine("");
      return;
    }

    outputChannel.appendLine(`File: ${activeFile.filePath}`);
    outputChannel.appendLine(`CLI: ${cliPath}`);

    const result = await runCli(
      command.action,
      activeFile.filePath,
      cliPath,
      outputChannel,
      command.title
    );

    const message = result.ok
      ? bilingualMessage(command.success_bn, command.success_en)
      : bilingualMessage(command.failure_bn, command.failure_en);
    outputChannel.appendLine(message);
    outputChannel.appendLine("");

    if (result.ok) {
      vscode.window.showInformationMessage(message);
      return;
    }

    vscode.window.showErrorMessage(message);
  });
}

function activate(context) {
  const outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  registerDiagnostics(context);

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGE_SELECTOR,
    {
      provideCompletionItems() {
        return KEYWORDS.map(createCompletionItem);
      },
    }
  );

  const hoverProvider = vscode.languages.registerHoverProvider(
    LANGUAGE_SELECTOR,
    {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z_]+/);
        if (!range) {
          return undefined;
        }

        const word = document.getText(range);
        const entry = getKeyword(word);
        if (!entry) {
          return undefined;
        }

        return new vscode.Hover(keywordMarkdown(entry), range);
      },
    }
  );

  const commands = COMMANDS.map((command) =>
    registerBnScriptCommand(context, outputChannel, command)
  );

  context.subscriptions.push(outputChannel, completionProvider, hoverProvider, ...commands);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  OUTPUT_CHANNEL_NAME,
};
