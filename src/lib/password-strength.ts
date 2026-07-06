export type StrengthLevel = "Muito Fraca" | "Fraca" | "Boa" | "Forte" | "Excelente";

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  level: StrengthLevel;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

const LEVELS: { level: StrengthLevel; color: string }[] = [
  { level: "Muito Fraca", color: "bg-destructive" },
  { level: "Fraca", color: "bg-orange-500" },
  { level: "Boa", color: "bg-yellow-500" },
  { level: "Forte", color: "bg-lime-500" },
  { level: "Excelente", color: "bg-green-600" },
];

export function evaluatePassword(pw: string): StrengthResult {
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.max(0, Math.min(4, passed - (pw.length < 6 ? 1 : 0))) as 0 | 1 | 2 | 3 | 4;
  return { score, ...LEVELS[score], checks };
}
