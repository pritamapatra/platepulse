const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(
  error: unknown,
  constraint?: string,
): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 3; depth++) {
    if (!current || typeof current !== "object") return false;
    const e = current as {
      code?: unknown;
      constraint_name?: unknown;
      cause?: unknown;
    };
    if (e.code === UNIQUE_VIOLATION) {
      return constraint === undefined || e.constraint_name === constraint;
    }
    current = e.cause;
  }
  return false;
}
