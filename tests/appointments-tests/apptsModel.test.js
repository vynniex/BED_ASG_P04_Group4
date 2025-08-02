// apptsModel.test.js
const { request } = require("express");
const apptsModel = require("../../appointments-api-grace/models/apptsModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("apptsModel", () => {
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

    it("getAllAppointmentsByUser shoud return formatted appointments", async () => {
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
        expect(result[0].formatted_datetime).toContain("Friday, 15 August 2025 at 10:00AM");

        expect(mockConnection.close).toHaveBeenCalled();
    });

    it("getAppointmentById should return appointment details by appointmentId", async () => {
        const appointmentId = 1;
        const mockAppointment = {
            appointment_date: new Date("2025-08-30T00:00:00Z"),
            appointment_time: "09:00 AM",
            clinic: "Outram Polyclinic",
        };

        mockRequest.query.mockResolvedValue({ recordset: [mockAppointment] });

        const result = await apptsModel.getAppointmentById(appointmentId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockConnection.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("appointmentId", appointmentId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(result).toEqual(mockAppointment);
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it("createAppointment should create a new appointment and return the appointment ID", async () => {
        const userId = "1";
        const appointmentData = {
            appointmentDate: "2025-08-20",
            appointmentTime: "11:00 AM",
            clinic: "Clementi Polyclinic",
            reason: "General Consultation"
        };

        const mockAppointmentId = 9;
        mockRequest.query.mockResolvedValue({ recordset: [{ appointment_id: mockAppointmentId }] });

        const result = await apptsModel.createAppointment(userId, appointmentData);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("userId", userId);
        expect(mockRequest.input).toHaveBeenCalledWith("appointment_date", appointmentData.appointmentDate);
        expect(mockRequest.input).toHaveBeenCalledWith("appointment_time", appointmentData.appointmentTime);
        expect(mockRequest.input).toHaveBeenCalledWith("clinic", appointmentData.clinic);
        expect(mockRequest.input).toHaveBeenCalledWith("reason", appointmentData.reason);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(result).toBe(mockAppointmentId);
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it("updateAppointmentById should update an appointment and return success", async () => {
        const appointmentId = 1;
        const updatedData = {
            appointmentDate: "2025-08-25",
            appointmentTime: "2:00 PM",
            clinic: "Punggol Polyclinic"
        };

        mockRequest.query.mockResolvedValue({}); // No result is needed

        const result = await apptsModel.updateAppointmentById(appointmentId, updatedData);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("apptDate", updatedData.appointmentDate);
        expect(mockRequest.input).toHaveBeenCalledWith("apptTime", updatedData.appointmentTime);
        expect(mockRequest.input).toHaveBeenCalledWith("clinic", updatedData.clinic);
        expect(mockRequest.input).toHaveBeenCalledWith("id", appointmentId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(result).toEqual({ success: true });
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it("deleteAppointmentById should delete an appointment", async () => {
        const appointmentId = 1;
        mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

        const result = await apptsModel.deleteAppointmentById(appointmentId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("id", appointmentId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(result).toBe(1);
        expect(mockConnection.close).toHaveBeenCalled();
    });
});