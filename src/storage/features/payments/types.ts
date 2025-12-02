export type RepeatRule = "none" | "monthly" | "weekly";

export interface PaymentReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;   // '2025-12-01'
  isRepeating: boolean;
  repeatRule: RepeatRule;
  isPaid: boolean;
}

export interface PaymentsState {
  id: "main";
  reminders: PaymentReminder[];
}
