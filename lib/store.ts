import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { StoreShape } from "@/lib/types";

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "japanese-learning-automation") : path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "state.json");

const initialState: StoreShape = {
  routinesByDate: {},
  generationLog: [],
};

async function ensureStoreExists() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(initialState, null, 2), "utf8");
  }
}

export async function readStore(): Promise<StoreShape> {
  await ensureStoreExists();
  const raw = await readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as StoreShape;
}

export async function writeStore(store: StoreShape) {
  await ensureStoreExists();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
