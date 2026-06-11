const fs = require("fs");
const path = require("path");

const CLI_PATH_SETTING = "bnscript.cliPath";

const COMMANDS = [
  {
    id: "bnscript.checkCurrentFile",
    title: "BN Script: Check Current File",
    action: "check",
    success_bn: "BN Script check sofol hoyeche.",
    success_en: "BN Script check completed successfully.",
    failure_bn: "Check byartho hoyeche.",
    failure_en: "Check failed.",
  },
  {
    id: "bnscript.buildCurrentFile",
    title: "BN Script: Build Current File",
    action: "build",
    success_bn: "BN Script build sofol hoyeche.",
    success_en: "BN Script build completed successfully.",
    failure_bn: "Build byartho hoyeche.",
    failure_en: "Build failed.",
  },
  {
    id: "bnscript.runCurrentFile",
    title: "BN Script: Run Current File",
    action: "run",
    success_bn: "BN Script run sofol hoyeche.",
    success_en: "BN Script run completed successfully.",
    failure_bn: "Run byartho hoyeche.",
    failure_en: "Run failed.",
  },
];

function getVscode() {
  return require("vscode");
}

function bilingualMessage(bn, en) {
  return `Bangla:\n${bn}\n\nEnglish:\n${en}`;
}

const CLI_NOT_FOUND_MESSAGE = bilingualMessage(
  'BN Script CLI khuje paoa jayni.\n\nVS Code Settings e\n"bnscript.cliPath"\nset korun.',
  'Could not find the BN Script CLI.\n\nPlease configure:\n\n"bnscript.cliPath"\n\nin VS Code Settings.'
);

function getConfiguredCliPath(vscodeApi = getVscode()) {
  const value = vscodeApi.workspace
    .getConfiguration("bnscript")
    .get("cliPath", "");
  return typeof value === "string" ? value.trim().replace(/^["']|["']$/g, "") : "";
}

function autoDetectCliPath(context, filePath, vscodeApi = getVscode()) {
  const workspaceFolder = vscodeApi.workspace.getWorkspaceFolder(
    vscodeApi.Uri.file(filePath)
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

function findCliPath(context, filePath, vscodeApi = getVscode()) {
  const configured = getConfiguredCliPath(vscodeApi);
  if (configured) {
    return fs.existsSync(configured) ? configured : null;
  }

  return autoDetectCliPath(context, filePath, vscodeApi);
}

function compilerPathFromCliPath(cliPath) {
  if (!cliPath) {
    return null;
  }

  const compilerPath = path.join(path.dirname(cliPath), "compiler.js");
  return fs.existsSync(compilerPath) ? compilerPath : null;
}

module.exports = {
  CLI_NOT_FOUND_MESSAGE,
  CLI_PATH_SETTING,
  COMMANDS,
  autoDetectCliPath,
  bilingualMessage,
  compilerPathFromCliPath,
  findCliPath,
  getConfiguredCliPath,
};
