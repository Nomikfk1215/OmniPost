import type { ValidationCheck, ValidationLevel, ValidationResult } from "@/types";

export function makeCheck(id: string, level: ValidationLevel, message: string): ValidationCheck {
  return { id, level, message };
}

export function buildValidationResult(checks: ValidationCheck[]): ValidationResult {
  const level = checks.some((check) => check.level === "error")
    ? "error"
    : checks.some((check) => check.level === "warning")
      ? "warning"
      : "pass";

  return {
    passed: level !== "error",
    level,
    warnings: checks
      .filter((check) => check.level !== "pass")
      .map((check) => check.message),
    checks
  };
}

export function hasEmoji(value: string) {
  return /\p{Extended_Pictographic}/u.test(value);
}
