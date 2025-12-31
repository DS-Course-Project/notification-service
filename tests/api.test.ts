import request from "supertest";
import { api } from "../lib/api";
import { getDb } from "../lib/db";

// Mock the getDb module
jest.mock("../lib/db", () => ({
    getDb: jest.fn(),
}));

describe("API Endpoints", () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockResolvedValue([]),
        };
        (getDb as jest.Mock).mockReturnValue(mockDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /user/:userId", () => {
        it("should return 200 and an empty list if no notifications found", async () => {
            const response = await request(api).get("/user/test-user-id");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(mockDb.select).toHaveBeenCalled();
            expect(mockDb.from).toHaveBeenCalled();
            expect(mockDb.where).toHaveBeenCalled();
        });

        it("should return notifications for a user", async () => {
            const mockNotifications = [
                { id: "1", userId: "test-user-id", message: "Test Notification" },
            ];
            mockDb.where.mockResolvedValue(mockNotifications);

            const response = await request(api).get("/user/test-user-id");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotifications);
        });
    });

    describe("GET /ticket/:ticketId", () => {
        it("should return 404 if notification not found", async () => {
            mockDb.where.mockResolvedValue([]);

            const response = await request(api).get("/ticket/123");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Notification not found" });
        });

        it("should return 200 and the notification if found", async () => {
            const mockNotification = { id: "123", userId: "test-user-id", message: "Test Notification" };
            mockDb.where.mockResolvedValue([mockNotification]);

            const response = await request(api).get("/ticket/123");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotification);
        });
    });
});
