// apptsController.test.js
const apptsController = require("../../appointments-api-grace/controllers/apptsController");
const apptsModel = require("../../appointments-api-grace/models/apptsModel");

// Mock the Appointment model
jest.mock("../appointments-api-grace/models/apptsModel");

// mock the Express response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockResolvedValue(res);
    res.send = jest.fn().mockResolvedValue(res);
    return res;
}

describe("apptsController", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("getAllAppointmentsByUser should return all appointments for the user", async () => {
        const req = { user: { id: "1"} };
        const res = mockResponse();

        const mockAppointments = [{ appointment_id: "2", appointment_date: "2025-08-01", appointment_time: "10:00 AM", 
            clinic: "Bukit Merah Polyclinic", reason: "General Consultation"}];
        apptsModel.getAllAppointmentsByUser.mockResolvedValue(mockAppointments);

        await apptsController.getAllAppointmentsByUser(req,res);

        expect(apptsModel.getAllAppointmentsByUser).toHaveBeenCalledWith("1");
        expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });

    it("getAppointmentById should return appointment data", async () => {
        const req = { params: { id: "2" } };
        const res = mockResponse();

        const mockAppointments = [{ appointment_date: "2025-08-01", appointment_time: "10:00 AM", 
            clinic: "Bukit Merah Polyclinic" }];
        apptsModel.getAppointmentById.mockResolvedValue(mockAppointments);

        await apptsController.getAppointmentById(req,res);

        expect(apptsModel.getAppointmentById).toHaveBeenCalledWith("2");
        expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });

    it("createAppointment should create and return appointment", async () => {
        const req = { 
            body: { appointment_date: "2025-08-10", appointment_time: "11:00 AM", 
                clinic: "Paris Ris Polyclinic", reason: "Migrane / Headache"},
            user: { id: "1"}
        };
        const res = mockResponse();
        
        const createdAppointments = [{ appointment_date: "2025-08-01", appointment_time: "10:00 AM", 
            clinic: "Bukit Merah Polyclinic", reason: "General Consultation"}];

        apptsModel.createAppointment.mockResolvedValue(createdAppointments);

        await apptsController.createAppointment(req,res);

        expect(apptsModel.createAppointment).toHaveBeenCalledWith("1", req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdAppointments);
    });

    it("updateAppointmentById should update and return success", async () => {
        const req = { 
            params: { id: "1"},
            body: { appointment_date: "2025-08-10", appointment_time: "11:00 AM", 
                clinic: "Paris Ris Polyclinic"}
        };
        const res = mockResponse();
        
        const updatedAppointment = { appointmentDate: req.body.appointment_date, appointmentTime: req.body.appointment_time, 
                clinic: req.body.clinic};
        const updatedresult = { success: true };

        apptsModel.updateAppointmentById.mockResolvedValue(updatedresult);

        await apptsController.updateAppointmentById(req,res);

        expect(apptsModel.updateAppointmentById).toHaveBeenCalledWith("1", updatedAppointment);
        expect(res.json).toHaveBeenCalledWith(updatedresult);
    });

    it("deleteAppointmentById should delete appointment and return 204", async () => {
        const req = { params: { id: "1" } };
        const res = mockResponse();

        const id = parseInt(req.params.id);

        apptsModel.deleteAppointmentById.mockResolvedValue(id);

        await apptsController.deleteAppointmentById(req,res);

        expect(apptsModel.deleteAppointmentById).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledWith();
        expect(res.json).not.toHaveBeenCalled();
    });

})