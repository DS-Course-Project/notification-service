import express, { Express, Request, Response } from "express";
import { getDb } from "./db";
import { notification } from "./db/schema";
import { eq } from "drizzle-orm";

const api: Express = express();

api.get("/user/:userId", async (req: Request, res: Response) => {
  const notifications = await getDb()
    .select()
    .from(notification)
    .where(eq(notification.userId, req.params.userId ?? ""));

  res.status(200).json(notifications);
});

api.get("/ticket/:ticketId", async (req: Request, res: Response) => {
  const notifications = await getDb()
    .select()
    .from(notification)
    .where(eq(notification.id, req.params.ticketId ?? ""));

  if (!notifications || notifications.length < 1) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }

  res.status(200).json(notifications[0]);
});

export { api };
