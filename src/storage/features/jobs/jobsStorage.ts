import { dbPromise } from "../../db";
import type { JobsState } from "./types";
import initialJobs from "../../data/jobs.json";

const JOBS_ID = "main";

export async function loadJobs(): Promise<JobsState> {
  const db = await dbPromise;
  const stored = await db.get("jobs", JOBS_ID);
  if (stored) return stored as JobsState;
  return initialJobs as JobsState;
}

export async function saveJobs(state: JobsState): Promise<void> {
  const db = await dbPromise;
  await db.put("jobs", state);
}
