import { z } from "zod";
import { rupeesToPaise } from "@/lib/money";

const MAX_OPENING_PAISE = 100_000_000;

export const openingCashSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter the opening cash")
    .transform((value, ctx) => {
      let paise: number;
      try {
        paise = rupeesToPaise(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Enter a valid amount" });
        return z.NEVER;
      }
      if (!Number.isInteger(paise)) {
        ctx.addIssue({ code: "custom", message: "Enter a valid amount" });
        return z.NEVER;
      }
      if (paise < 0) {
        ctx.addIssue({ code: "custom", message: "Amount cannot be negative" });
        return z.NEVER;
      }
      if (paise > MAX_OPENING_PAISE) {
        ctx.addIssue({ code: "custom", message: "Amount is too high" });
        return z.NEVER;
      }
      return paise;
    }),
});
