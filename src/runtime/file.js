import {
  access,
  appendFile,
  readFile,
  readdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { BNRuntimeError } from "./errors.js";

function fileError(message, path, operation, cause) {
  return new BNRuntimeError(`${message}: "${path}" - ${cause.message}`, {
    operation,
    path,
    cause,
  });
}

async function read(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw fileError("Failed to read file", path, "file.read", error);
  }
}

async function write(path, data) {
  try {
    await writeFile(path, String(data), "utf8");
  } catch (error) {
    throw fileError("Failed to write file", path, "file.write", error);
  }
}

async function append(path, data) {
  try {
    await appendFile(path, String(data), "utf8");
  } catch (error) {
    throw fileError("Failed to append to file", path, "file.append", error);
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function deleteFile(path) {
  try {
    await unlink(path);
  } catch (error) {
    throw fileError("Failed to delete file", path, "file.delete", error);
  }
}

async function list(dir) {
  try {
    return await readdir(dir);
  } catch (error) {
    throw fileError("Failed to list directory", dir, "file.list", error);
  }
}

async function readJSON(path) {
  const content = await read(path);

  try {
    return JSON.parse(content);
  } catch (error) {
    throw fileError("Failed to parse JSON file", path, "file.readJSON", error);
  }
}

async function writeJSON(path, data, indent = 2) {
  try {
    await write(path, JSON.stringify(data, null, indent));
  } catch (error) {
    if (error instanceof BNRuntimeError) {
      throw error;
    }

    throw fileError("Failed to write JSON file", path, "file.writeJSON", error);
  }
}

export const __bn_file = {
  read,
  write,
  append,
  exists,
  delete: deleteFile,
  list,
  readJSON,
  writeJSON,
};
