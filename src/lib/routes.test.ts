import { describe, expect, it } from "vitest";
import { isPublicPath } from "@/lib/routes";

describe("isPublicPath", () => {
  it.each(["/", "/login", "/signup", "/auth/confirm", "/api/health"])(
    "allows %s",
    (path) => {
      expect(isPublicPath(path)).toBe(true);
    },
  );

  it.each(["/account", "/sell", "/loginx", "/authority", "/api/health-x"])(
    "protects %s",
    (path) => {
      expect(isPublicPath(path)).toBe(false);
    },
  );
});
