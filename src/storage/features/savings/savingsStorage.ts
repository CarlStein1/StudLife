import { dbPromise } from "../../db";
import type { SavingsState } from "./types";
import initialSavings from "../../data/savings.json";

const SAVINGS_ID = "main";

export async function loadSavings(): Promise<SavingsState> {
  const db = await dbPromise;
  const stored = await db.get("savings", SAVINGS_ID);
  if (stored) return stored as SavingsState;
  return initialSavings as SavingsState;
}

export async function saveSavings(state: SavingsState): Promise<void> {
  const db = await dbPromise;
  await db.put("savings", state);
}
