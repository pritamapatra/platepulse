import { describe, expect, it } from "vitest";
import { homePathFor, isPublicPath } from "@/lib/routes";

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

describe("homePathFor", () => {
  it("sends a cashier to Sell", () => {
    expect(homePathFor("cashier")).toBe("/sell");
  });

  it("sends an owner to the account page until the shell exists", () => {
    expect(homePathFor("owner")).toBe("/account");
  });
});
