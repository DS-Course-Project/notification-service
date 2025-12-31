import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import globalObjects from "../global-objects";

export function getDb() {
  if (!globalObjects.db) {
    globalObjects.db = drizzle(process.env.DATABASE_URL!);
  }
  return globalObjects.db;
}
