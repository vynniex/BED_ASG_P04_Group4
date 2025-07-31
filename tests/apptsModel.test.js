// apptsModel.test.js
const { request } = require("express");
const apptsModel = require("../appointments-api-grace/models/apptsModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("apptsModel.getAllAppointmentsByUser", () => {
    let mockRequest, mockConnection;

    beforeEach(() => {
        // Mock request chain: input().query()
        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn(),
        };

        // Mock connection
        mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn(),
        };

        sql.connect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it("shoud return formatted appointments", async () => {
        const userId = "1";

        const mockRecordset = [
            {
                appointment_id: 1,
                appointment_date: new Date("2025-08-15T00:00:00Z"),
                appointment_time: "10:00AM",
                clinic: "Bukit Merah Polyclinic",
                reason: "General Consultation"
            }
        ];

        mockRequest.query.mockResolvedValue({ recordset: mockRecordset});

        const result = await apptsModel.getAllAppointmentsByUser(userId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockConnection.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("userId", userId);
        expect(mockRequest.query).toHaveBeenCalled();

        expect(result[0]).toHaveProperty("formatted_datetime");
        expect(result[0].formatted_datetime).toContain("at 10:00 AM");

        expect(mockConnection.close).toHaveBeenCalled();
        })
});