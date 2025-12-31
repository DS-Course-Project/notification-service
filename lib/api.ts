import express, { Express, Request, Response } from "express";
import { getDb } from "./db";
import { notification } from "./db/schema";
import { eq } from "drizzle-orm";

const api: Express = express();

api.get("/notifications", async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const notifications = await getDb().select().from(notification).where(eq(notification.userId, userId.toString()));

  res.status(200).json(notifications);
});

api.get("/notifications/user/:userId", async (req: Request, res: Response) => {
  const notifications = await getDb()
    .select()
    .from(notification)
    .where(eq(notification.userId, req.params.userId ?? ""));

  res.status(200).json(notifications);
});

api.get("/notifications/ticket/:ticketId", async (req: Request, res: Response) => {
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

api.patch("/notifications/:id/read", async (req: Request, res: Response) => {
  const notificationId = req.params.id;
  console.log(notificationId);
  if (!notificationId) {
    res.status(400).json({ message: "Notification id is required" });
    return;
  }

  const db = getDb();
  await db.update(notification).set({ isRead: true }).where(eq(notification.id, notificationId));

  res.status(200).json({ message: "Notification read" });
});

export { api };
