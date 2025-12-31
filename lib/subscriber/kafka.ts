import { Kafka } from "kafkajs";
import globalObjects from "../global-objects";
import { ticketCreatedHandler } from "./event-handlers/ticket-created";
import { ticketStatusChangedHandler } from "./event-handlers/ticket-status-changed";
import { ticketCommentAddedHandler } from "./event-handlers/ticket-comment-added";

export function getKafka() {
  if (!globalObjects.kafka) {
    globalObjects.kafka = new Kafka({
      clientId: "notification-service",
      brokers: ["localhost:9092"],
    });
  }
  return globalObjects.kafka;
}

const ticketAddedConsumer = async () => {
  const kafka = getKafka();
  const ticketCreatedConsumer = kafka.consumer({ groupId: "notification-service-consumers-create" });

  await ticketCreatedConsumer.connect();

  await ticketCreatedConsumer.subscribe({ topics: ["tickets.CREATED"], fromBeginning: true });

  await ticketCreatedConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(message, topic, partition);
      if (!message.key || !message.value) {
        return;
      }

      const key = message["key"].toString();
      const value = message["value"].toString();

      await ticketCreatedHandler({ ...JSON.parse(value) });
    },
  });
};

const ticketCommentAddedConsumer = async () => {
  const kafka = getKafka();
  const ticketCommentAddedConsumer = kafka.consumer({ groupId: "notification-service-consumers-comment-add" });

  await ticketCommentAddedConsumer.connect();

  await ticketCommentAddedConsumer.subscribe({ topic: "tickets.COMMENT_ADDED", fromBeginning: true });

  await ticketCommentAddedConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.key || !message.value) {
        return;
      }

      const value = message["value"].toString();

      await ticketCommentAddedHandler(JSON.parse(value));
    },
  });
};

const ticketStatusChangedConsumer = async () => {
  const kafka = getKafka();
  const ticketStatusChangedConsumer = kafka.consumer({ groupId: "notification-service-consumers-status-change" });

  await ticketStatusChangedConsumer.connect();

  await ticketStatusChangedConsumer.subscribe({ topic: "tickets.STATUS_CHANGED", fromBeginning: true });

  await ticketStatusChangedConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.key || !message.value) {
        return;
      }

      const value = message["value"].toString();

      await ticketStatusChangedHandler(JSON.parse(value));
    },
  });
};

export async function runKafka() {
  ticketAddedConsumer();
  ticketCommentAddedConsumer();
  ticketStatusChangedConsumer();
}

export async function stopKafka() {
  const kafka = getKafka();
  const ticketCreatedConsumer = kafka.consumer({ groupId: "notification-service-consumers" });
  const ticketCommentAddedConsumer = kafka.consumer({ groupId: "notification-service-consumers" });
  const ticketStatusChangedConsumer = kafka.consumer({ groupId: "notification-service-consumers" });

  await ticketCreatedConsumer.disconnect();
  await ticketCommentAddedConsumer.disconnect();
  await ticketStatusChangedConsumer.disconnect();
}
