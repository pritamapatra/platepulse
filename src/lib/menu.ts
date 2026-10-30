import { z } from "zod";
import { rupeesToPaise } from "@/lib/money";

const MAX_PRICE_PAISE = 10_000_000;

export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter an item name")
    .max(60, "Use 60 characters or fewer"),
  price: z
    .string()
    .trim()
    .min(1, "Enter a price")
    .transform((value, ctx) => {
      let paise: number;
      try {
        paise = rupeesToPaise(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Enter a valid price" });
        return z.NEVER;
      }
      if (!Number.isInteger(paise)) {
        ctx.addIssue({ code: "custom", message: "Enter a valid price" });
        return z.NEVER;
      }
      if (paise <= 0) {
        ctx.addIssue({ code: "custom", message: "Enter a price above zero" });
        return z.NEVER;
      }
      if (paise > MAX_PRICE_PAISE) {
        ctx.addIssue({ code: "custom", message: "Price is too high" });
        return z.NEVER;
      }
      return paise;
    }),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
