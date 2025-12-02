import { useEffect, useState } from "react";
import type { PaymentsState, PaymentReminder } from "./types";
import { loadPayments, savePayments } from "./paymentsStorage";

export function usePayments() {
  const [payments, setPayments] = useState<PaymentsState | null>(null);
  const isLoading = payments === null;

  useEffect(() => {
    loadPayments().then(setPayments);
  }, []);

  useEffect(() => {
    if (!payments) return;
    savePayments(payments).catch(() => {});
  }, [payments]);

  const addReminder = (reminder: PaymentReminder) => {
    setPayments((prev) =>
      prev ? { ...prev, reminders: [...prev.reminders, reminder] } : prev
    );
  };

  const updateReminder = (id: string, partial: Partial<PaymentReminder>) => {
    setPayments((prev) =>
      prev
        ? {
            ...prev,
            reminders: prev.reminders.map((r) =>
              r.id === id ? { ...r, ...partial } : r
            ),
          }
        : prev
    );
  };

  const removeReminder = (id: string) => {
    setPayments((prev) =>
      prev ? { ...prev, reminders: prev.reminders.filter((r) => r.id !== id) } : prev
    );
  };

  return { payments, isLoading, addReminder, updateReminder, removeReminder };
}
