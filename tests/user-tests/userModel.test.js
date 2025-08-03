// userModel.test.js
const userModel = require("../../appointments-api-grace/models/userModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("userModel", () => {
    let mockRequest, mockConnection;

    const testUser = {
        nric: 'S5056789C',
        fullName: 'Bob Tan',
        email: 'bob@gmail.com',
        password: 'Bob123',
        contact: '90011234',
        dob: '1950-02-28',
    };

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

    it("createUser insert a new user and returns userId", async () => {
        mockRequest.query.mockResolvedValue({ recordset: [{ userId: 1 }] });

        const userId = await userModel.createUser(testUser);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith('nric_fin', testUser.nric);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(userId).toBe(1);
    });

    test('findUserByEmail returns the user by the user email', async () => {
        const expectedUser = { email: testUser.email };
        mockRequest.query.mockResolvedValue({ recordset: [expectedUser] });

        const user = await userModel.findUserByEmail(testUser.email);

        expect(mockRequest.input).toHaveBeenCalledWith('email', testUser.email);
        expect(user).toEqual(expectedUser);
    });
    
    test('findUserById returns the user with userId', async () => {
        const expectedUser = { userId: 1 };
        mockRequest.query.mockResolvedValue({ recordset: [expectedUser] });

        const user = await userModel.findUserById(1);

        expect(mockRequest.input).toHaveBeenCalledWith('userId', 1);
        expect(user).toEqual(expectedUser);
    });

    test('updateUserById updates the user and returns rowsAffected', async () => {
        mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

        const result = await userModel.updateUserById(1, {
            fullName: 'Updated Name',
            email: 'updated@example.com',
            contact: '88887777',
            dob: '1960-01-01'
        });

        expect(mockRequest.input).toHaveBeenCalledWith('userId', 1);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(result).toBe(1);
    });


    test('deleteUserById can only be deletd if there is no existing appointments', async () => {
        mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

        const rowsDeleted = await userModel.deleteUserById(1);

        expect(mockRequest.input).toHaveBeenCalledWith('userId', 1);
        expect(rowsDeleted).toBe(1);
    });
});