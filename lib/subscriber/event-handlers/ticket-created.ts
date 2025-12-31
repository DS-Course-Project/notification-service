import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { notification, ticket, user } from "../../db/schema";

class TicketCreatedEvent {
  constructor(
    public ticketId: string,
    public title: string,
    public description: string,
    public priority: string,
    public status: string,
    public createdAt: string
  ) {}

  static fromObject(obj: any): TicketCreatedEvent {
    if (!obj || !obj.ticketId || !obj.title || !obj.description || !obj.priority || !obj.status || !obj.createdAt) {
      throw new Error("Invalid event received");
    }
    return new TicketCreatedEvent(obj.ticketId, obj.title, obj.description, obj.priority, obj.status, obj.createdAt);
  }
}

export async function ticketCreatedHandler(event: unknown) {
  let ticketCreatedEvent: TicketCreatedEvent | undefined;
  try {
    ticketCreatedEvent = TicketCreatedEvent.fromObject(event);
  } catch (error) {
    console.error("Invalid event received", event);
    return;
  }

  if (!ticketCreatedEvent) {
    console.error("Invalid event received", event);
    return;
  }

  console.log("Ticket created event received", event);
  const db = getDb();
  const existingTicket = await db.select().from(ticket).where(eq(ticket.id, ticketCreatedEvent.ticketId));

  if (!existingTicket.length || existingTicket.length < 1) {
    console.error("Couldn't find ticket with id: " + ticketCreatedEvent.ticketId, "Event", event);
    return;
  }

  const admins = await db.select().from(user).where(eq(user.role, "admin"));
  if (!admins || admins.length < 1) {
    console.log("No admins found", admins, "Event", event);
    return;
  }

  const notifications = admins.map((admin) => {
    return {
      eventType: "ticket_created",
      userId: admin.id,
      message: JSON.stringify({
        ticket: existingTicket[0],
      }),
    };
  });

  const newNotification = await db.insert(notification).values(notifications);

  console.log("New notifications created", notifications[0]);
}
