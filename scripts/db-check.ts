import { sql } from "drizzle-orm";
import { client, db } from "@/db";

async function main() {
  const rows = await db.execute(sql`select now() as server_time`);
  console.log("DB OK:", rows[0].server_time);
  await client.end();
}

main().catch((e) => {
  console.error("DB FAILED:", e.message);
  process.exit(1);
});
