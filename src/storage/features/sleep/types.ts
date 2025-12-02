export interface SleepEntry {
  date: string;        // '2025-11-24'
  sleepStart: string;  // '23:00'
  sleepEnd: string;    // '07:30'
  hours: number;       // 7.5
}

export interface SleepSettings {
  targetHours: number; // цель по сну
  bedTime: string;     // '23:00'
  wakeTime: string;    // '07:30'
}

export interface SleepState {
  id: "main";
  settings: SleepSettings;
  history: SleepEntry[];
}
