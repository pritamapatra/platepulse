import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  const rows = await db.execute(sql`select now() as server_time`);
  return Response.json({ ok: true, serverTime: rows[0].server_time });
}
