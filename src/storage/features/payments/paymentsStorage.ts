import { dbPromise } from "../../db";
import type { PaymentsState } from "./types";
import initialPayments from "../../data/payments.json";

const PAYMENTS_ID = "main";

export async function loadPayments(): Promise<PaymentsState> {
  const db = await dbPromise;
  const stored = await db.get("payments", PAYMENTS_ID);
  if (stored) return stored as PaymentsState;
  return initialPayments as PaymentsState;
}

export async function savePayments(state: PaymentsState): Promise<void> {
  const db = await dbPromise;
  await db.put("payments", state);
}
