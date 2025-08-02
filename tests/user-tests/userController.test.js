// userController.test.js
const userController = require("../../appointments-api-grace/controllers/userController");
const apptsModel = require("../../appointments-api-grace/models/apptsModel");
const userModel = require("../../appointments-api-grace/models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock the User model
jest.mock("../appointments-api-grace/models/userModel");
jest.mock("../appointments-api-grace/models/apptsModel");

// mock the Express response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    res.send = jest.fn().mockResolvedValue(res);
    return res;
}

;

describe("userController", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("createUser should create an user account", async () => {
        const req = { body: 
            {   nric: "1",
                fullname: "Bob Tan",
                email: "bob@gmail.com", 
                password: "Bob123", 
                contact_num: "90011234", 
                dob: "1950-02-28",
            } 
        };
        const res = mockResponse();

        userModel.findUserByEmail.mockResolvedValue(null);
        userModel.createUser.mockResolvedValue({id: "1"});

        await userController.createUser(req,res);

        expect(userModel.createUser).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({id: "1"});
    });

    it("loginUser should login a user and return token", async () => {
        const mockUser = {
            nric: "S5056789C",
            userId: 1,
            full_name: "Bob Tan",
            email: "bob@gmail.com",
            contact_num: "90011234",
            dob: "1950-02-28",
            password: await bcrypt.hash("Bob123", 10)
        }
        const req = {
            body: {
                email: "bob@gmail.com",
                password: "Bob123"
            }
        };

        const res = mockResponse();

        userModel.findUserByEmail.mockResolvedValue(mockUser);

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const jsonResponse = res.json.mock.calls[0][0];

        expect(jsonResponse).toHaveProperty('message', 'Login successful');
        expect(jsonResponse).toHaveProperty('token');
        expect(jsonResponse.user).toEqual({
            fullName: mockUser.full_name,
            email: mockUser.email,
            contact: mockUser.contact_num,
            dob: mockUser.dob
        });
    });

    it("verify should verify NRIC successfully", async () => {
        const hashedNric = await bcrypt.hash("S5056789C", 10);
        const req = {
            body: { nric: "S5056789C" },
            headers: { authorization: `Bearer testToken` }
        };
        const res = mockResponse();

        const user = { userId: 1, nric_fin: hashedNric };
        
        jwt.verify = jest.fn().mockReturnValue({ id: 1 });
        userModel.findUserById.mockResolvedValue(user);

        await userController.verify(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "NRIC verification successful." });
    });

    it("getUserDetailsById should return user details", async () => {
        const req = { user: { id: "1" } };
        const res = mockResponse();

        userModel.findUserById.mockResolvedValue({ id: "1", full_name: "Bob Tan" });

        await userController.getUserDetailsById(req, res);

        expect(res.json).toHaveBeenCalledWith({ id: "1", full_name: "Bob Tan" });
    });

    it("deleteUserById should delete user if no appointments attached", async () => {
        const req = { params: { id: "1" } };
        const res = mockResponse();

        apptsModel.getAllAppointmentsByUser.mockResolvedValue([]);
        userModel.deleteUserById.mockResolvedValue();

        await userController.deleteUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});
