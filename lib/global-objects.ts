import { drizzle } from "drizzle-orm/node-postgres";
import { Kafka } from "kafkajs";

interface GlobalObjects {
  kafka: Kafka | null;
  db: ReturnType<typeof drizzle> | null;
}

const globalObjects: GlobalObjects = {
  kafka: null,
  db: null,
};

export default globalObjects;
