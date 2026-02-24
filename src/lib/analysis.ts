// Simple client-side sentiment analysis using keyword matching
const positiveWords = new Set([
  "happy", "great", "good", "wonderful", "amazing", "love", "enjoy", "grateful",
  "excited", "proud", "confident", "peaceful", "calm", "relaxed", "hopeful",
  "motivated", "energized", "fulfilled", "content", "joyful", "optimistic",
  "inspired", "accomplished", "thankful", "blessed", "cheerful"
]);

const negativeWords = new Set([
  "stressed", "anxious", "worried", "sad", "depressed", "tired", "exhausted",
  "overwhelmed", "frustrated", "angry", "lonely", "scared", "hopeless",
  "burnout", "pressure", "failing", "struggling", "crying", "panic",
  "insomnia", "nightmare", "dread", "miserable", "helpless", "worthless"
]);

const stressKeywords = new Set([
  "deadline", "exam", "assignment", "project", "grade", "fail", "study",
  "pressure", "workload", "competition", "performance", "test", "quiz"
]);

const anxietyKeywords = new Set([
  "worry", "nervous", "anxious", "panic", "fear", "uncertain", "doubt",
  "overthinking", "restless", "uneasy", "tense", "dread"
]);

export interface SentimentResult {
  score: number; // -1 to 1
  label: string;
  emotions: string[];
  keywords: string[];
  insight: string;
}

export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  let posCount = 0;
  let negCount = 0;
  const detectedKeywords: string[] = [];
  const emotions = new Set<string>();

  words.forEach((word) => {
    if (positiveWords.has(word)) posCount++;
    if (negativeWords.has(word)) negCount++;
    if (stressKeywords.has(word)) {
      emotions.add("stress");
      detectedKeywords.push(word);
    }
    if (anxietyKeywords.has(word)) {
      emotions.add("anxiety");
      detectedKeywords.push(word);
    }
  });

  if (posCount > negCount) emotions.add("happiness");
  if (negCount > posCount) emotions.add("distress");
  if (posCount === 0 && negCount === 0) emotions.add("neutral");

  const total = posCount + negCount || 1;
  const score = (posCount - negCount) / total;

  let label = "Neutral";
  if (score > 0.3) label = "Positive";
  else if (score > 0) label = "Slightly Positive";
  else if (score < -0.3) label = "Concerning";
  else if (score < 0) label = "Slightly Negative";

  const emotionList = Array.from(emotions);
  let insight = "";
  if (emotionList.includes("stress") && emotionList.includes("anxiety")) {
    insight = "Your journal indicates significant academic stress and anxiety. Consider talking to someone you trust.";
  } else if (emotionList.includes("stress")) {
    insight = "Your journal indicates moderate academic stress. Remember to take breaks between study sessions.";
  } else if (emotionList.includes("anxiety")) {
    insight = "Some signs of anxiety detected. Deep breathing exercises may help you feel more grounded.";
  } else if (emotionList.includes("happiness")) {
    insight = "Great to see positive emotions! Keep doing what makes you feel good.";
  } else {
    insight = "Your mood seems stable. Keep journaling to track your wellbeing over time.";
  }

  return { score, label, emotions: emotionList, keywords: detectedKeywords, insight };
}

export function calculateBurnoutRisk(inputs: {
  sleepHours: number;
  studyHours: number;
  screenTime: number;
  socialInteraction: number;
  stressLevel: number;
}): { risk: "Low" | "Medium" | "High"; score: number; suggestions: string[] } {
  const { sleepHours, studyHours, screenTime, socialInteraction, stressLevel } = inputs;

  let score = 0;
  const suggestions: string[] = [];

  // Sleep
  if (sleepHours < 5) { score += 30; suggestions.push("Aim for at least 7-8 hours of sleep"); }
  else if (sleepHours < 7) { score += 15; suggestions.push("Try to get a bit more sleep"); }

  // Study
  if (studyHours > 10) { score += 25; suggestions.push("Take regular breaks during study sessions"); }
  else if (studyHours > 7) { score += 12; }

  // Screen time
  if (screenTime > 8) { score += 20; suggestions.push("Reduce screen time, especially before bed"); }
  else if (screenTime > 5) { score += 10; }

  // Social
  if (socialInteraction < 2) { score += 20; suggestions.push("Spend more time with friends or family"); }
  else if (socialInteraction < 4) { score += 8; }

  // Stress
  score += stressLevel * 3;
  if (stressLevel > 7) suggestions.push("Practice mindfulness or meditation");

  if (suggestions.length === 0) suggestions.push("You're doing great! Keep maintaining your healthy habits");

  const risk = score > 60 ? "High" : score > 35 ? "Medium" : "Low";
  return { risk, score: Math.min(100, score), suggestions };
}

export function scoreQuestionnaire(answers: number[]): {
  total: number;
  anxiety: number;
  stress: number;
  fatigue: number;
  level: string;
} {
  const anxiety = (answers[0] + answers[1] + answers[2]) / 3;
  const stress = (answers[3] + answers[4] + answers[5]) / 3;
  const fatigue = (answers[6] + answers[7] + answers[8]) / 3;
  const total = Math.round(((anxiety + stress + fatigue) / 3) * 10) / 10;

  let level = "Good";
  if (total > 3.5) level = "Needs Attention";
  else if (total > 2.5) level = "Moderate";

  return { total, anxiety: Math.round(anxiety * 10) / 10, stress: Math.round(stress * 10) / 10, fatigue: Math.round(fatigue * 10) / 10, level };
}
