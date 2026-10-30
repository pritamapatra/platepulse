CREATE TYPE "public"."member_role" AS ENUM('owner', 'cashier');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'upi');--> statement-breakpoint
CREATE TYPE "public"."purchase_issue" AS ENUM('none', 'short', 'excess', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."purchase_quality" AS ENUM('good', 'acceptable', 'poor');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_closes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"opening_cash_paise" integer NOT NULL,
	"counted_cash_paise" integer,
	"upi_reported_paise" integer,
	"expected_cash_paise" integer,
	"expected_upi_paise" integer,
	"note" text,
	"closed_at" timestamp with time zone,
	"locked_at" timestamp with time zone,
	"locked_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_closes_restaurant_date_uq" UNIQUE("restaurant_id","business_date"),
	CONSTRAINT "daily_closes_opening_nonneg" CHECK ("daily_closes"."opening_cash_paise" >= 0),
	CONSTRAINT "daily_closes_counted_nonneg" CHECK ("daily_closes"."counted_cash_paise" >= 0),
	CONSTRAINT "daily_closes_upi_nonneg" CHECK ("daily_closes"."upi_reported_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"client_request_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"category" text NOT NULL,
	"paid_to" text,
	"method" "payment_method" NOT NULL,
	"amount_paise" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "expenses_restaurant_request_uq" UNIQUE("restaurant_id","client_request_id"),
	CONSTRAINT "expenses_amount_positive" CHECK ("expenses"."amount_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ingredients_restaurant_name_uq" UNIQUE("restaurant_id","name")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_restaurant_user_uq" UNIQUE("restaurant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"price_paise" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_price_positive" CHECK ("menu_items"."price_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"unit" text NOT NULL,
	"rate_paise" integer NOT NULL,
	"line_total_paise" integer NOT NULL,
	"quality" "purchase_quality" DEFAULT 'good' NOT NULL,
	"issue" "purchase_issue" DEFAULT 'none' NOT NULL,
	CONSTRAINT "purchase_lines_quantity_positive" CHECK ("purchase_lines"."quantity" > 0),
	CONSTRAINT "purchase_lines_rate_positive" CHECK ("purchase_lines"."rate_paise" > 0),
	CONSTRAINT "purchase_lines_total_positive" CHECK ("purchase_lines"."line_total_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"client_request_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"total_paise" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "purchases_restaurant_request_uq" UNIQUE("restaurant_id","client_request_id"),
	CONSTRAINT "purchases_total_positive" CHECK ("purchases"."total_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"name_snapshot" text NOT NULL,
	"unit_price_paise" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "sale_lines_price_positive" CHECK ("sale_lines"."unit_price_paise" > 0),
	CONSTRAINT "sale_lines_quantity_positive" CHECK ("sale_lines"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"client_request_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"total_paise" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "sales_restaurant_request_uq" UNIQUE("restaurant_id","client_request_id"),
	CONSTRAINT "sales_total_positive" CHECK ("sales"."total_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "supplier_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"purchase_id" uuid,
	"created_by" uuid NOT NULL,
	"client_request_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"method" "payment_method" NOT NULL,
	"amount_paise" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "supplier_payments_restaurant_request_uq" UNIQUE("restaurant_id","client_request_id"),
	CONSTRAINT "supplier_payments_amount_positive" CHECK ("supplier_payments"."amount_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_restaurant_name_uq" UNIQUE("restaurant_id","name")
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closes" ADD CONSTRAINT "daily_closes_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_lines" ADD CONSTRAINT "purchase_lines_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_lines" ADD CONSTRAINT "purchase_lines_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_lines" ADD CONSTRAINT "sale_lines_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_lines" ADD CONSTRAINT "sale_lines_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_restaurant_created_idx" ON "audit_events" USING btree ("restaurant_id","created_at");--> statement-breakpoint
CREATE INDEX "expenses_restaurant_date_idx" ON "expenses" USING btree ("restaurant_id","business_date");--> statement-breakpoint
CREATE INDEX "menu_items_restaurant_idx" ON "menu_items" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "purchase_lines_purchase_idx" ON "purchase_lines" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "purchases_restaurant_supplier_idx" ON "purchases" USING btree ("restaurant_id","supplier_id");--> statement-breakpoint
CREATE INDEX "purchases_restaurant_date_idx" ON "purchases" USING btree ("restaurant_id","business_date");--> statement-breakpoint
CREATE INDEX "sale_lines_sale_idx" ON "sale_lines" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sales_restaurant_date_idx" ON "sales" USING btree ("restaurant_id","business_date");--> statement-breakpoint
CREATE INDEX "supplier_payments_restaurant_supplier_idx" ON "supplier_payments" USING btree ("restaurant_id","supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_payments_restaurant_date_idx" ON "supplier_payments" USING btree ("restaurant_id","business_date");