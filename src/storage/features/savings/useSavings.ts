import { useEffect, useState } from "react";
import type { SavingsState, SavingsGoal } from "./types";
import { loadSavings, saveSavings } from "./savingsStorage";

export function useSavings() {
  const [savings, setSavings] = useState<SavingsState | null>(null);
  const isLoading = savings === null;

  useEffect(() => {
    loadSavings().then(setSavings);
  }, []);

  useEffect(() => {
    if (!savings) return;
    saveSavings(savings).catch(() => {});
  }, [savings]);

  const updateGoal = (id: string, partial: Partial<SavingsGoal>) => {
    setSavings((prev) =>
      prev
        ? {
            ...prev,
            goals: prev.goals.map((g) =>
              g.id === id ? { ...g, ...partial } : g
            ),
          }
        : prev
    );
  };

  const addGoal = (goal: SavingsGoal) => {
    setSavings((prev) =>
      prev ? { ...prev, goals: [...prev.goals, goal] } : prev
    );
  };

  const removeGoal = (id: string) => {
    setSavings((prev) =>
      prev ? { ...prev, goals: prev.goals.filter((g) => g.id !== id) } : prev
    );
  };

  return { savings, isLoading, updateGoal, addGoal, removeGoal };
}
