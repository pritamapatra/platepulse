import { describe, expect, it, vi } from "vitest";
import { createCashierAccount } from "@/lib/cashiers";

const input = {
  restaurantId: "restaurant-1",
  email: "cashier@example.com",
  password: "password-123",
};

function makeDeps() {
  return {
    createAuthUser: vi.fn(),
    addCashierMembership: vi.fn(),
    deleteAuthUser: vi.fn(),
  };
}

describe("createCashierAccount", () => {
  it("creates the user and the cashier membership", async () => {
    const deps = makeDeps();
    deps.createAuthUser.mockResolvedValue({ id: "user-1" });
    deps.addCashierMembership.mockResolvedValue(undefined);

    const result = await createCashierAccount(input, deps);

    expect(result).toEqual({ ok: true, userId: "user-1" });
    expect(deps.addCashierMembership).toHaveBeenCalledWith(
      "user-1",
      "restaurant-1",
    );
    expect(deps.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("writes no membership when the auth user cannot be created", async () => {
    const deps = makeDeps();
    deps.createAuthUser.mockResolvedValue({ error: "Email already used" });

    const result = await createCashierAccount(input, deps);

    expect(result).toEqual({ ok: false, error: "Email already used" });
    expect(deps.addCashierMembership).not.toHaveBeenCalled();
  });

  it("deletes the auth user when the membership insert fails", async () => {
    const deps = makeDeps();
    deps.createAuthUser.mockResolvedValue({ id: "user-1" });
    deps.addCashierMembership.mockRejectedValue(new Error("db down"));
    deps.deleteAuthUser.mockResolvedValue(undefined);

    const result = await createCashierAccount(input, deps);

    expect(result.ok).toBe(false);
    expect(deps.deleteAuthUser).toHaveBeenCalledWith("user-1");
  });
});
