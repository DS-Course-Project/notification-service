import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { notification, ticket } from "../../db/schema";

class TicketStatusChangedEvent {
  constructor(public ticketId: string, public status: string, public userId: string, public createdAt: Date) {}

  static fromObject(obj: any): TicketStatusChangedEvent {
    if (!obj || !obj.ticketId || !obj.status || !obj.userId || !obj.createdAt) {
      throw new Error("Invalid event received");
    }
    return new TicketStatusChangedEvent(obj.ticketId, obj.status, obj.userId, obj.createdAt);
  }
}

export async function ticketStatusChangedHandler(event: unknown) {
  let ticketStatusChangedEvent: TicketStatusChangedEvent | undefined;
  try {
    ticketStatusChangedEvent = TicketStatusChangedEvent.fromObject(event);
  } catch (error) {
    console.error("Invalid event received", event);
    return;
  }

  if (!ticketStatusChangedEvent) {
    console.error("Invalid event received", event);
    return;
  }

  console.log("Ticket status changed event received", event);

  const db = getDb();
  const existingTicket = await db.select().from(ticket).where(eq(ticket.id, ticketStatusChangedEvent.ticketId));
  if (!existingTicket || existingTicket.length < 1) {
    console.error("Ticket not found", ticketStatusChangedEvent.ticketId, "Event", event);
    return;
  }

  const newNotification = await db
    .insert(notification)
    .values({
      eventType: "ticket_status_changed",
      userId: ticketStatusChangedEvent.userId,
      message: JSON.stringify({
        ticket: existingTicket[0],
        status: ticketStatusChangedEvent.status,
      }),
    })
    .returning();

  console.log("New notification created", newNotification[0]);
}
