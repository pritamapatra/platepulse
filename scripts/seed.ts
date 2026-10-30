import { client, db } from "@/db";
import { menuItems, memberships, restaurants, suppliers } from "@/db/schema";

const RESTAURANT_ID = "00000000-0000-4000-8000-000000000001";
const OWNER_USER_ID = "00000000-0000-4000-8000-0000000000a1";
const CASHIER_USER_ID = "00000000-0000-4000-8000-0000000000a2";

const items = [
  { id: "00000000-0000-4000-8000-0000000000b1", name: "Tea", pricePaise: 1000 },
  {
    id: "00000000-0000-4000-8000-0000000000b2",
    name: "Samosa",
    pricePaise: 1500,
  },
  {
    id: "00000000-0000-4000-8000-0000000000b3",
    name: "Coffee",
    pricePaise: 2000,
  },
  {
    id: "00000000-0000-4000-8000-0000000000b4",
    name: "Omelette",
    pricePaise: 3000,
  },
  {
    id: "00000000-0000-4000-8000-0000000000b5",
    name: "Biryani",
    pricePaise: 12000,
  },
];

const supplierRows = [
  { id: "00000000-0000-4000-8000-0000000000c1", name: "Mohan Vegetables" },
  { id: "00000000-0000-4000-8000-0000000000c2", name: "Raju Dairy" },
];

async function main() {
  await db.transaction(async (tx) => {
    await tx
      .insert(restaurants)
      .values({ id: RESTAURANT_ID, name: "Demo Tea Stall" })
      .onConflictDoNothing();
    await tx
      .insert(memberships)
      .values([
        { restaurantId: RESTAURANT_ID, userId: OWNER_USER_ID, role: "owner" },
        {
          restaurantId: RESTAURANT_ID,
          userId: CASHIER_USER_ID,
          role: "cashier",
        },
      ])
      .onConflictDoNothing();
    await tx
      .insert(menuItems)
      .values(items.map((i) => ({ ...i, restaurantId: RESTAURANT_ID })))
      .onConflictDoNothing();
    await tx
      .insert(suppliers)
      .values(supplierRows.map((s) => ({ ...s, restaurantId: RESTAURANT_ID })))
      .onConflictDoNothing();
  });
  console.log("Seed OK");
  await client.end();
}

main().catch((e) => {
  console.error("Seed FAILED:", e.message);
  process.exit(1);
});
