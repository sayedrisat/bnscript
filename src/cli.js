#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "./compiler.js";
import { runRepl } from "./repl.js";

const COMMANDS = new Set(["check", "build", "run", "repl"]);

function usage() {
  return `Usage:
  bn check file.bn
  bn build file.bn
  bn run file.bn
  bn file.bn
  bn repl
`;
}

function outputPathFor(inputPath) {
  const extension = extname(inputPath);
  const baseName = extension
    ? basename(inputPath, extension)
    : basename(inputPath);
  return join(dirname(inputPath), `${baseName}.js`);
}

function write(stream, text) {
  stream.write(text);
}

function formatError(error) {
  if (typeof error?.format === "function") {
    return error.format();
  }

  const category = error?.category || error?.name || "Error";
  const message = error?.message || String(error);
  return `BN Script Error [${category}]\n\n${message}\n`;
}

function writeDiagnostics(diagnostics, stream) {
  for (const diagnostic of diagnostics) {
    write(stream, `${formatError(diagnostic)}\n`);
  }
}

async function readSource(filePath) {
  return await readFile(filePath, "utf8");
}

async function checkCommand(filePath, io) {
  const source = await readSource(filePath);
  const result = compile(source, { filename: filePath });

  if (result.diagnostics.length > 0) {
    writeDiagnostics(result.diagnostics, io.stderr);
    return 1;
  }

  write(io.stdout, `BN Script check passed: ${filePath}\n`);
  return 0;
}

async function buildCommand(filePath, io) {
  const source = await readSource(filePath);
  const result = compile(source, { filename: filePath });

  if (result.diagnostics.length > 0) {
    writeDiagnostics(result.diagnostics, io.stderr);
    return 1;
  }

  const outputPath = outputPathFor(filePath);
  await writeFile(outputPath, result.js, "utf8");
  write(io.stdout, `Built ${outputPath}\n`);
  return 0;
}

async function runCommand(filePath, io) {
  const source = await readSource(filePath);
  const result = compile(source, {
    filename: filePath,
    runtimeImport: new URL("./runtime/index.js", import.meta.url).href,
  });

  if (result.diagnostics.length > 0) {
    writeDiagnostics(result.diagnostics, io.stderr);
    return 1;
  }

  const tempDir = await mkdtemp(join(tmpdir(), "bnscript-run-"));
  const tempFile = join(tempDir, `${basename(filePath, extname(filePath))}.mjs`);

  try {
    await writeFile(tempFile, result.js, "utf8");
    await import(pathToFileURL(tempFile).href);
    return 0;
  } catch (error) {
    write(io.stderr, `${formatError(error)}\n`);
    return error?.name === "BNRuntimeError" ? 2 : 1;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function main(argv = process.argv.slice(2), io = {
  input: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
}) {
  let [command, filePath] = argv;

  if (typeof command === "string" && command.toLowerCase().endsWith(".bn")) {
    if (filePath) {
      write(io.stderr, usage());
      return 1;
    }

    filePath = command;
    command = "run";
  }

  if (!COMMANDS.has(command)) {
    write(io.stderr, usage());
    return 1;
  }

  try {
    if (command === "repl") {
      if (filePath) {
        write(io.stderr, usage());
        return 1;
      }

      return await runRepl(io);
    }

    if (!filePath) {
      write(io.stderr, usage());
      return 1;
    }

    if (command === "check") {
      return await checkCommand(filePath, io);
    }

    if (command === "build") {
      return await buildCommand(filePath, io);
    }

    return await runCommand(filePath, io);
  } catch (error) {
    write(io.stderr, `${formatError(error)}\n`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
