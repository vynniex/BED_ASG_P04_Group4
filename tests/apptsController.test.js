// apptsController.test.js
const apptsController = require("../appointments-api-grace/controllers/apptsController");
const apptsModel = require("../appointments-api-grace/models/apptsModel");

// Mock the Book model
jest.mock("../appointments-api-grace/models/apptsModel");

// mock the Express response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    res.send = jest.fn();
    return res;
}

describe("apptsController.getAllAppointmentsByUser", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("should return all appointments for the user", async () => {
        const req = { user: { id: "1" } };
        const res = mockResponse();

        const mockAppointments = [{ appointment_id: "2", appointment_date: "2025-08-01", appointment_time: "10:00 AM", 
            clinic: "Bukit Merah Polyclinic", reason: "General Consultation"}];
        apptsModel.getAllAppointmentsByUser.mockResolvedValue(mockAppointments);

        await apptsController.getAllAppointmentsByUser(req,res);

        expect(apptsModel.getAllAppointmentsByUser).toHaveBeenCalledWith("1");
        expect(res.json).toHaveBeenCalledWith(mockAppointments);
    })
})