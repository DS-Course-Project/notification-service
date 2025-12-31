import { api } from "./lib/api";
import { getDb } from "./lib/db";
import { runKafka, stopKafka } from "./lib/subscriber/kafka";

api.listen(3003, () => {
  console.log("API running on port 3003");

  getDb();

  runKafka().catch((error) => {
    console.error("Failed to run Kafka", error);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing Kafka");
  stopKafka();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing Kafka");
  stopKafka();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception", error);
  stopKafka();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection", reason);
  stopKafka();
});
