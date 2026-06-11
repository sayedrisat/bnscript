import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const {
  CLI_NOT_FOUND_MESSAGE,
  CLI_PATH_SETTING,
  findCliPath,
  getConfiguredCliPath,
} = require("../vscode/src/commands.js");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("vscode cli path: setting is contributed", async () => {
  const pkg = await readJson("vscode/package.json");
  const setting = pkg.contributes.configuration.properties["bnscript.cliPath"];

  assert.strictEqual(setting.type, "string");
  assert.strictEqual(setting.default, "");
  assert.ok(setting.markdownDescription.includes("src"));
  assert.ok(setting.markdownDescription.includes("cli.js"));
});

test("vscode cli path: commands read setting", async () => {
  const source = await readFile("vscode/src/commands.js", "utf8");
  const vscodeApi = {
    workspace: {
      getConfiguration() {
        return {
          get() {
            return '"C:\\\\bnscript\\\\src\\\\cli.js"';
          },
        };
      },
    },
  };

  assert.strictEqual(CLI_PATH_SETTING, "bnscript.cliPath");
  assert.strictEqual(getConfiguredCliPath(vscodeApi), "C:\\\\bnscript\\\\src\\\\cli.js");
  assert.ok(source.includes('getConfiguration("bnscript")'));
  assert.ok(source.includes('get("cliPath", "")'));
});

test("vscode cli path: diagnostics use shared setting-aware resolver", async () => {
  const source = await readFile("vscode/src/diagnostics.js", "utf8");

  assert.ok(source.includes('require("./commands")'));
  assert.ok(source.includes("findCliPath(context, document.uri.fsPath)"));
  assert.ok(source.includes("compilerPathFromCliPath(cliPath)"));
  assert.ok(source.includes("CLI_NOT_FOUND_MESSAGE"));
});

test("vscode cli path: fallback auto-detection still works", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "bnscript-vscode-path-"));
  const src = join(root, "src");
  const cliPath = join(src, "cli.js");

  t.after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  await mkdir(src);
  await writeFile(cliPath, "", "utf8");

  const vscodeApi = {
    Uri: {
      file(filePath) {
        return { fsPath: filePath };
      },
    },
    workspace: {
      getConfiguration() {
        return {
          get() {
            return "";
          },
        };
      },
      getWorkspaceFolder() {
        return {
          uri: {
            fsPath: root,
          },
        };
      },
    },
  };

  assert.strictEqual(getConfiguredCliPath(vscodeApi), "");
  assert.strictEqual(
    findCliPath({ extensionPath: join(root, "vscode") }, join(root, "main.bn"), vscodeApi),
    cliPath
  );
});

test("vscode cli path: missing cli message mentions setting", () => {
  assert.ok(CLI_NOT_FOUND_MESSAGE.includes("bnscript.cliPath"));
  assert.ok(CLI_NOT_FOUND_MESSAGE.includes("Could not find the BN Script CLI"));
  assert.ok(CLI_NOT_FOUND_MESSAGE.includes("VS Code Settings"));
});
