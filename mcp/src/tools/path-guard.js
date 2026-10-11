import fs from "node:fs";
import path from "node:path";

/**
 * Read a file strictly inside a known project root. Requiring real paths also
 * closes directory-symlink escapes. Paths must be explicit, regular text files.
 * A project root must be discovered separately from the agent's working dir.
 */
export function readProjectFile(projectRoot, requestedPath, allowedExtensions, maxBytes = 1024 * 1024) {
  if (!projectRoot || typeof requestedPath !== "string" || !requestedPath.trim()) {
    throw new Error("A project root and non-empty file path are required.");
  }
  if (requestedPath.includes("\0")) throw new Error("NUL bytes are not allowed in paths.");
  const root = fs.realpathSync(projectRoot);
  const candidate = path.isAbsolute(requestedPath)
    ? requestedPath
    : path.resolve(root, requestedPath);
  const target = fs.realpathSync(candidate);
  const relative = path.relative(root, target);
  if (relative === "" || relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) {
    throw new Error("File access denied: path is outside the project root.");
  }
  const pieces = relative.split(path.sep);
  if (pieces.some(p => p === ".git" || p === ".b0x" || p === "node_modules" || p === ".env" || p.startsWith(".env."))) {
    throw new Error("File access denied: internal or private project paths are excluded.");
  }
  const ext = path.extname(target).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error("File type not allowed: " + (ext || "(none)"));
  }
  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.size > maxBytes) {
    throw new Error("Only regular files up to " + maxBytes + " bytes can be audited.");
  }
  return fs.readFileSync(target, "utf8");
}

export const MARKUP_EXTENSIONS = [".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro", ".js", ".ts"];
export const TOKEN_EXTENSIONS = [".json"];
