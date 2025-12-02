import { dbPromise } from "../../db";
import type { SleepState } from "./types";
import initialSleep from "../../data/sleep.json";

const SLEEP_ID = "main";

export async function loadSleepState(): Promise<SleepState> {
  const db = await dbPromise;
  const stored = await db.get("sleep", SLEEP_ID);
  if (stored) return stored as SleepState;
  return initialSleep as SleepState;
}

export async function saveSleepState(state: SleepState): Promise<void> {
  const db = await dbPromise;
  await db.put("sleep", state);
}
