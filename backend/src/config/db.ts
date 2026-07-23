import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(import.meta.dirname, "..", "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJson<T>(filename: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function appendToJson<T>(filename: string, item: T): void {
  const existing = readJson<T[]>(filename, []);
  existing.unshift(item);
  writeJson(filename, existing);
}
