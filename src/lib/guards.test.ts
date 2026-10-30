import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError, requireRole } from "@/lib/guards";
import { getSession, type AppSession } from "@/lib/session";

vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));

const mockedGetSession = vi.mocked(getSession);

function session(role: AppSession["role"]): AppSession {
  return {
    userId: "user-1",
    email: "user@example.com",
    restaurantId: "restaurant-1",
    role,
  };
}

describe("requireRole", () => {
  beforeEach(() => {
    mockedGetSession.mockReset();
  });

  it("rejects a signed-out caller", async () => {
    mockedGetSession.mockResolvedValue(null);
    await expect(requireRole("owner")).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("rejects a cashier calling an owner-only action", async () => {
    mockedGetSession.mockResolvedValue(session("cashier"));
    const result = requireRole("owner");
    await expect(result).rejects.toBeInstanceOf(AuthError);
    await expect(result).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns the session for an owner", async () => {
    mockedGetSession.mockResolvedValue(session("owner"));
    await expect(requireRole("owner")).resolves.toMatchObject({
      role: "owner",
      restaurantId: "restaurant-1",
    });
  });

  it("allows a cashier when the guard lists both roles", async () => {
    mockedGetSession.mockResolvedValue(session("cashier"));
    await expect(requireRole("owner", "cashier")).resolves.toMatchObject({
      role: "cashier",
    });
  });
});
