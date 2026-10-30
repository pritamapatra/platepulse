const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function hasPgCode(error: unknown, code: string, constraint?: string): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 3; depth++) {
    if (!current || typeof current !== "object") return false;
    const e = current as {
      code?: unknown;
      constraint_name?: unknown;
      cause?: unknown;
    };
    if (e.code === code) {
      return constraint === undefined || e.constraint_name === constraint;
    }
    current = e.cause;
  }
  return false;
}

export function isUniqueViolation(
  error: unknown,
  constraint?: string,
): boolean {
  return hasPgCode(error, UNIQUE_VIOLATION, constraint);
}

export function isForeignKeyViolation(
  error: unknown,
  constraint?: string,
): boolean {
  return hasPgCode(error, FOREIGN_KEY_VIOLATION, constraint);
}
