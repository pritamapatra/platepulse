import { describe, expect, it } from "vitest";
import { cartSignature, nextAttempt } from "@/lib/sale-attempt";

let counter = 0;
const newId = () => "id-" + ++counter;

describe("cartSignature", () => {
  it("ignores line order", () => {
    const a = cartSignature({ tea: 1, samosa: 2 }, "cash");
    const b = cartSignature({ samosa: 2, tea: 1 }, "cash");
    expect(a).toBe(b);
  });

  it("changes with quantity or method", () => {
    const base = cartSignature({ tea: 1 }, "cash");
    expect(cartSignature({ tea: 2 }, "cash")).not.toBe(base);
    expect(cartSignature({ tea: 1 }, "upi")).not.toBe(base);
  });

  it("ignores zero quantities", () => {
    expect(cartSignature({ tea: 1, samosa: 0 }, "cash")).toBe(
      cartSignature({ tea: 1 }, "cash"),
    );
  });
});

describe("nextAttempt", () => {
  it("creates an attempt when there is none", () => {
    const sig = cartSignature({ tea: 1 }, "cash");
    const attempt = nextAttempt(null, sig, newId);
    expect(attempt.signature).toBe(sig);
    expect(attempt.id).toBeTruthy();
  });

  it("reuses the id for an identical retry", () => {
    const sig = cartSignature({ tea: 1 }, "cash");
    const first = nextAttempt(null, sig, newId);
    const retry = nextAttempt(first, sig, newId);
    expect(retry.id).toBe(first.id);
  });

  it("issues a new id when the cart changed", () => {
    const first = nextAttempt(null, cartSignature({ tea: 1 }, "cash"), newId);
    const changed = nextAttempt(
      first,
      cartSignature({ tea: 2 }, "cash"),
      newId,
    );
    expect(changed.id).not.toBe(first.id);
  });

  it("issues a new id when the method changed", () => {
    const first = nextAttempt(null, cartSignature({ tea: 1 }, "cash"), newId);
    const changed = nextAttempt(first, cartSignature({ tea: 1 }, "upi"), newId);
    expect(changed.id).not.toBe(first.id);
  });
});
