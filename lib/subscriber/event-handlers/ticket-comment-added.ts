import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { notification, ticket } from "../../db/schema";

class TicketCommentAddedEvent {
  constructor(public ticketId: string, public comment: string, public userId: string, public createdAt: Date) {}

  static fromObject(obj: any): TicketCommentAddedEvent {
    if (!obj || !obj.ticketId || !obj.comment || !obj.userId || !obj.createdAt) {
      throw new Error("Invalid event received");
    }
    return new TicketCommentAddedEvent(obj.ticketId, obj.comment, obj.userId, obj.createdAt);
  }
}

export async function ticketCommentAddedHandler(event: unknown) {
  let ticketCommentAddedEvent: TicketCommentAddedEvent | undefined;
  try {
    ticketCommentAddedEvent = TicketCommentAddedEvent.fromObject(event);
  } catch (error) {
    console.error("Invalid event received", event);
    return;
  }

  if (!ticketCommentAddedEvent) {
    console.error("Invalid event received", event);
    return;
  }

  console.log("Ticket comment added event received", event);

  const db = getDb();

  const existingTickets = await db.select().from(ticket).where(eq(ticket.id, ticketCommentAddedEvent.ticketId));
  if (!existingTickets.length || existingTickets.length < 1) {
    console.error("Couldn't find ticket with id: " + ticketCommentAddedEvent.ticketId, "Event", event);
    return;
  }

  const newNotification = await db
    .insert(notification)
    .values({
      eventType: "ticket_comment_added",
      userId: ticketCommentAddedEvent.userId,
      message: JSON.stringify({
        ticket: existingTickets[0],
        comment: ticketCommentAddedEvent.comment,
      }),
    })
    .returning();

  console.log("New notification created", newNotification[0]);
}
