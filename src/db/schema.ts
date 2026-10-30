import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", ["owner", "cashier"]);

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    userId: uuid("user_id").notNull(),
    role: memberRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("memberships_restaurant_user_uq").on(t.restaurantId, t.userId),
  ],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    name: text("name").notNull(),
    pricePaise: integer("price_paise").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("menu_items_price_positive", sql`${t.pricePaise} > 0`),
    index("menu_items_restaurant_idx").on(t.restaurantId),
  ],
);

export const paymentMethod = pgEnum("payment_method", ["cash", "upi"]);

export const sales = pgTable(
  "sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    createdBy: uuid("created_by").notNull(),
    clientRequestId: uuid("client_request_id").notNull(),
    businessDate: date("business_date", { mode: "string" }).notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    totalPaise: integer("total_paise").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    check("sales_total_positive", sql`${t.totalPaise} > 0`),
    unique("sales_restaurant_request_uq").on(t.restaurantId, t.clientRequestId),
    index("sales_restaurant_date_idx").on(t.restaurantId, t.businessDate),
  ],
);

export const saleLines = pgTable(
  "sale_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => sales.id),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id),
    nameSnapshot: text("name_snapshot").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [
    check("sale_lines_price_positive", sql`${t.unitPricePaise} > 0`),
    check("sale_lines_quantity_positive", sql`${t.quantity} > 0`),
    index("sale_lines_sale_idx").on(t.saleId),
  ],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    name: text("name").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("suppliers_restaurant_name_uq").on(t.restaurantId, t.name)],
);

export const ingredients = pgTable(
  "ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    name: text("name").notNull(),
    unit: text("unit").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("ingredients_restaurant_name_uq").on(t.restaurantId, t.name)],
);

export const purchaseQuality = pgEnum("purchase_quality", [
  "good",
  "acceptable",
  "poor",
]);

export const purchaseIssue = pgEnum("purchase_issue", [
  "none",
  "short",
  "excess",
  "damaged",
]);

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    createdBy: uuid("created_by").notNull(),
    clientRequestId: uuid("client_request_id").notNull(),
    businessDate: date("business_date", { mode: "string" }).notNull(),
    totalPaise: integer("total_paise").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    check("purchases_total_positive", sql`${t.totalPaise} > 0`),
    unique("purchases_restaurant_request_uq").on(
      t.restaurantId,
      t.clientRequestId,
    ),
    index("purchases_restaurant_supplier_idx").on(t.restaurantId, t.supplierId),
    index("purchases_restaurant_date_idx").on(t.restaurantId, t.businessDate),
  ],
);

export const purchaseLines = pgTable(
  "purchase_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseId: uuid("purchase_id")
      .notNull()
      .references(() => purchases.id),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredients.id),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unit: text("unit").notNull(),
    ratePaise: integer("rate_paise").notNull(),
    lineTotalPaise: integer("line_total_paise").notNull(),
    quality: purchaseQuality("quality").notNull().default("good"),
    issue: purchaseIssue("issue").notNull().default("none"),
  },
  (t) => [
    check("purchase_lines_quantity_positive", sql`${t.quantity} > 0`),
    check("purchase_lines_rate_positive", sql`${t.ratePaise} > 0`),
    check("purchase_lines_total_positive", sql`${t.lineTotalPaise} > 0`),
    index("purchase_lines_purchase_idx").on(t.purchaseId),
  ],
);

export const supplierPayments = pgTable(
  "supplier_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    purchaseId: uuid("purchase_id").references(() => purchases.id),
    createdBy: uuid("created_by").notNull(),
    clientRequestId: uuid("client_request_id").notNull(),
    businessDate: date("business_date", { mode: "string" }).notNull(),
    method: paymentMethod("method").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    check("supplier_payments_amount_positive", sql`${t.amountPaise} > 0`),
    unique("supplier_payments_restaurant_request_uq").on(
      t.restaurantId,
      t.clientRequestId,
    ),
    index("supplier_payments_restaurant_supplier_idx").on(
      t.restaurantId,
      t.supplierId,
    ),
    index("supplier_payments_restaurant_date_idx").on(
      t.restaurantId,
      t.businessDate,
    ),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    createdBy: uuid("created_by").notNull(),
    clientRequestId: uuid("client_request_id").notNull(),
    businessDate: date("business_date", { mode: "string" }).notNull(),
    category: text("category").notNull(),
    paidTo: text("paid_to"),
    method: paymentMethod("method").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    check("expenses_amount_positive", sql`${t.amountPaise} > 0`),
    unique("expenses_restaurant_request_uq").on(
      t.restaurantId,
      t.clientRequestId,
    ),
    index("expenses_restaurant_date_idx").on(t.restaurantId, t.businessDate),
  ],
);

export const dailyCloses = pgTable(
  "daily_closes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    businessDate: date("business_date", { mode: "string" }).notNull(),
    openingCashPaise: integer("opening_cash_paise").notNull(),
    countedCashPaise: integer("counted_cash_paise"),
    upiReportedPaise: integer("upi_reported_paise"),
    expectedCashPaise: integer("expected_cash_paise"),
    expectedUpiPaise: integer("expected_upi_paise"),
    note: text("note"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedBy: uuid("locked_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("daily_closes_opening_nonneg", sql`${t.openingCashPaise} >= 0`),
    check("daily_closes_counted_nonneg", sql`${t.countedCashPaise} >= 0`),
    check("daily_closes_upi_nonneg", sql`${t.upiReportedPaise} >= 0`),
    unique("daily_closes_restaurant_date_uq").on(
      t.restaurantId,
      t.businessDate,
    ),
  ],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    actorId: uuid("actor_id").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_events_restaurant_created_idx").on(
      t.restaurantId,
      t.createdAt,
    ),
  ],
);
