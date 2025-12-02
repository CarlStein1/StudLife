import { useEffect, useState } from "react";
import type { SleepState } from "./types";
import { loadSleepState, saveSleepState } from "./sleepStorage";

// ===== helpers для дат =====

// универсальный парсер: '2025-12-01' или '01.12.2025' → Date
function parseSleepDate(value: string): Date {
  if (!value) return new Date(0);

  if (value.includes(".")) {
    // dd.mm.yyyy
    const [d, m, y] = value.split(".");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  if (value.includes("-")) {
    // yyyy-mm-dd
    const [y, m, d] = value.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const dt = new Date(value);
  return isNaN(dt.getTime()) ? new Date(0) : dt;
}

// всегда храним дату как "dd.mm.yyyy"
function normalizeDateToDDMMYYYY(raw: string): string {
  if (!raw) return raw;

  if (raw.includes(".")) {
    // уже dd.mm.yyyy — просто приводим к двум цифрам
    const [d, m, y] = raw.split(".");
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return `${day}.${month}.${y}`;
  }

  if (raw.includes("-")) {
    // yyyy-mm-dd → dd.mm.yyyy
    const [y, m, d] = raw.split("-");
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return `${day}.${month}.${y}`;
  }

  const dt = new Date(raw);
  if (!isNaN(dt.getTime())) {
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = String(dt.getFullYear());
    return `${day}.${month}.${year}`;
  }

  return raw;
}

export function useSleepState() {
  const [sleep, setSleep] = useState<SleepState | null>(null);
  const isLoading = sleep === null;

  // загрузка при первом рендере
  useEffect(() => {
    loadSleepState().then(setSleep);
  }, []);

  // авто-сохранение в IndexedDB
  useEffect(() => {
    if (!sleep) return;
    saveSleepState(sleep).catch(() => {});
  }, [sleep]);

  const updateSettings = (partial: Partial<SleepState["settings"]>) => {
    setSleep((prev) =>
      prev
        ? {
            ...prev,
            settings: { ...prev.settings, ...partial },
          }
        : prev
    );
  };

  const addEntry = (entry: {
    date: string;
    sleepStart: string;
    sleepEnd: string;
    hours: number;
  }) => {
    setSleep((prev) => {
      if (!prev) return prev;

      // нормализуем дату новой записи
      const normalizedDate = normalizeDateToDDMMYYYY(entry.date);
      const newEntry = { ...entry, date: normalizedDate };

      // нормализуем существующую историю (на случай старого формата)
      const normalizedHistory = prev.history.map((e) => ({
        ...e,
        date: normalizeDateToDDMMYYYY(e.date),
      }));

      // заменяем запись с той же датой, если уже есть
      const merged = [
        ...normalizedHistory.filter((e) => e.date !== normalizedDate),
        newEntry,
      ];

      // сортируем по реальной дате (от старых к новым)
      const sorted = merged.sort(
        (a, b) =>
          parseSleepDate(a.date).getTime() - parseSleepDate(b.date).getTime()
      );

      // оставляем последние 7 дней (самые новые)
      const last7 = sorted.slice(-7);

      return { ...prev, history: last7 };
    });
  };

  return { sleep, isLoading, updateSettings, addEntry };
}
