import { createContext, useContext, useState, ReactNode } from "react";
import type { SentimentResult } from "@/lib/analysis";

interface WellbeingEntry {
  date: string;
  mood?: string;
  journalSentiment?: SentimentResult;
  burnoutRisk?: "Low" | "Medium" | "High";
  burnoutScore?: number;
  cameraEmotion?: string;
  questionnaireScore?: number;
}

interface WellbeingContextType {
  entries: WellbeingEntry[];
  addEntry: (entry: Partial<WellbeingEntry>) => void;
  latestEntry: () => WellbeingEntry;
}

const WellbeingContext = createContext<WellbeingContextType | null>(null);

export const useWellbeing = () => {
  const ctx = useContext(WellbeingContext);
  if (!ctx) throw new Error("useWellbeing must be within WellbeingProvider");
  return ctx;
};

export const WellbeingProvider = ({ children }: { children: ReactNode }) => {
  const today = new Date().toISOString().split("T")[0];
  const [entries, setEntries] = useState<WellbeingEntry[]>([
    // Sample historical data for demo
    { date: "2026-02-18", mood: "😊", burnoutScore: 22, questionnaireScore: 1.8 },
    { date: "2026-02-19", mood: "😐", burnoutScore: 35, questionnaireScore: 2.4 },
    { date: "2026-02-20", mood: "😟", burnoutScore: 52, questionnaireScore: 3.1 },
    { date: "2026-02-21", mood: "😊", burnoutScore: 28, questionnaireScore: 2.0 },
    { date: "2026-02-22", mood: "😐", burnoutScore: 40, questionnaireScore: 2.6 },
    { date: "2026-02-23", mood: "😊", burnoutScore: 18, questionnaireScore: 1.5 },
    { date: today, mood: "😊" },
  ]);

  const addEntry = (partial: Partial<WellbeingEntry>) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.date === today);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...partial };
        return updated;
      }
      return [...prev, { date: today, ...partial }];
    });
  };

  const latestEntry = () => entries.find((e) => e.date === today) || { date: today };

  return (
    <WellbeingContext.Provider value={{ entries, addEntry, latestEntry }}>
      {children}
    </WellbeingContext.Provider>
  );
};
