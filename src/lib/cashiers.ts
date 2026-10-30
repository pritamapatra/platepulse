export type CashierDeps = {
  createAuthUser: (
    email: string,
    password: string,
  ) => Promise<{ id: string } | { error: string }>;
  addCashierMembership: (userId: string, restaurantId: string) => Promise<void>;
  deleteAuthUser: (userId: string) => Promise<void>;
};

export type CashierInput = {
  restaurantId: string;
  email: string;
  password: string;
};

export type CashierResult =
  { ok: true; userId: string } | { ok: false; error: string };

export async function createCashierAccount(
  input: CashierInput,
  deps: CashierDeps,
): Promise<CashierResult> {
  const created = await deps.createAuthUser(input.email, input.password);
  if ("error" in created) return { ok: false, error: created.error };

  try {
    await deps.addCashierMembership(created.id, input.restaurantId);
  } catch {
    await deps.deleteAuthUser(created.id).catch(() => undefined);
    return { ok: false, error: "Could not create the cashier. Try again." };
  }

  return { ok: true, userId: created.id };
}
