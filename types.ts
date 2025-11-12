
export interface TrainingEntry {
  type: string;
  duration: number; // minutes
  rpe: number; // 1-10
  sweatSatisfied: boolean;
  kneePain: number; // 0-10
  generalFatigue: number; // 0-10
}

export interface SleepEntry {
  bedTime: string; // HH:mm
  sleepTime: string; // HH:mm
  wakeTime: string; // HH:mm
}

export interface CognitiveMetrics {
  focusLevel: number; // 1-10
  mentalFog: number; // 1-10 (10 = clarity)
  energyLevel: number; // 1-10
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  
  // Daily Checklist
  wakeUpCheck: boolean;
  lightTherapyCheck: boolean;
  tyrosineBreakfastCheck: boolean;
  tyrosineBreakfastNotes?: string;
  mindfulnessCheck: boolean;
  shutdownRitualCheck: boolean;
  sleepTimeCheck: boolean;

  // Detailed Logs
  trainingLog: TrainingEntry | null;
  sleepLog: SleepEntry | null;
  cognitiveMetrics: CognitiveMetrics | null;
}

export type Logs = Record<string, DailyLog>;
