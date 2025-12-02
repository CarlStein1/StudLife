export interface SavingsGoal {
  id: string;
  title: string;
  saved: number;
  target: number;
}

export interface SavingsState {
  id: "main";
  goals: SavingsGoal[];
}
