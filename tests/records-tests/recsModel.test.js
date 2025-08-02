// recsModel.test.js
const sql = require("mssql");
const recsModel = require("../../records-api-xuening/models/recsModel");

jest.mock("mssql");

describe("Records Model", () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    sql.connect.mockResolvedValue({
      request: () => mockRequest,
      close: jest.fn().mockResolvedValue(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test duplicate dates in records for same user
  describe("isDuplicateDate", () => {
    test("returns true if duplicate date exists (without excludeRecordId)", async () => {
      mockRequest.query.mockResolvedValue({ recordset: [{ count: 1 }] });
      const result = await recsModel.isDuplicateDate(1, "2025-07-25");
      expect(result).toBe(true);
      expect(mockRequest.input).toHaveBeenCalledWith("userId", sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith("date", sql.Date, "2025-07-25");
    });

    test("returns false if no duplicate", async () => {
      mockRequest.query.mockResolvedValue({ recordset: [{ count: 0 }] });
      const result = await recsModel.isDuplicateDate(2, "2025-07-26");
      expect(result).toBe(false);
    });

    test("excludes record by excludeRecordId when provided", async () => {
      mockRequest.query.mockResolvedValue({ recordset: [{ count: 0 }] });
      const result = await recsModel.isDuplicateDate(1, "2025-07-25", 3);
      expect(result).toBe(false);
      expect(mockRequest.input).toHaveBeenCalledWith("excludeId", sql.Int, 3);
    });
  });

  // Test GET all records
  describe("getAllRecords", () => {
    test("returns all records", async () => {
      const records = [
        { recordId: 1, userId: 1, date: "2025-07-25", doctorName: "Dr. Tan Wei Ming", diagnosis: "High blood pressure", notes: "Monitor blood pressure every morning" },
        { recordId: 2, userId: 2, date: "2025-07-24", doctorName: "Dr. Siti Rahimah", diagnosis: "Type 2 Diabetes", notes: "Avoid sugary drinks" },
      ];
      mockRequest.query.mockResolvedValue({ recordset: records });
      const result = await recsModel.getAllRecords();
      expect(result).toEqual(records);
      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Records");
    });
  });

  // Test GEt record by Id
  describe("getRecordById", () => {
    test("returns record if found", async () => {
      const record = { recordId: 1, userId: 1, date: "2025-07-25", doctorName: "Dr. Tan Wei Ming", diagnosis: "High blood pressure", notes: "Monitor blood pressure every morning" };
      mockRequest.query.mockResolvedValue({ recordset: [record] });
      const result = await recsModel.getRecordById(1);
      expect(result).toEqual(record);
      expect(mockRequest.input).toHaveBeenCalledWith("id", 1);
    });

    test("returns null if record not found", async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      const result = await recsModel.getRecordById(999);
      expect(result).toBeNull();
    });
  });

  // Test POST a new record
describe("createRecord", () => {
  test("creates record and returns new record", async () => {
    const newRecordData = {
      userId: 3,
      date: "2025-07-26",
      doctorName: "Dr. Alex Ng",
      diagnosis: "Flu",
      notes: null, // test nullable notes
      weight: 55.2,
      systolic: 118,
      diastolic: 76,
    };

    // 1st call: insert query
    mockRequest.query.mockResolvedValueOnce({ recordset: [{ recordId: 5 }] });

    // 2nd call: getRecordById() result
    mockRequest.query.mockResolvedValueOnce({
      recordset: [
        {
          recordId: 5,
          ...newRecordData,
        },
      ],
    });

    const result = await recsModel.createRecord(newRecordData);
    expect(result).toEqual({ recordId: 5, ...newRecordData });

    expect(mockRequest.input).toHaveBeenCalledWith("userId", sql.Int, newRecordData.userId);
    expect(mockRequest.input).toHaveBeenCalledWith("date", sql.Date, newRecordData.date);
    expect(mockRequest.input).toHaveBeenCalledWith("doctorName", sql.NVarChar(100), newRecordData.doctorName);
    expect(mockRequest.input).toHaveBeenCalledWith("diagnosis", sql.NVarChar(255), newRecordData.diagnosis);
    expect(mockRequest.input).toHaveBeenCalledWith("notes", sql.NVarChar(100), null);
    expect(mockRequest.input).toHaveBeenCalledWith("weight", sql.Float, 55.2);
    expect(mockRequest.input).toHaveBeenCalledWith("systolic", sql.Int, 118);
    expect(mockRequest.input).toHaveBeenCalledWith("diastolic", sql.Int, 76);
  });
});

// Test PUT record
describe("updateRecordById", () => {
  test("updates record and returns updated record", async () => {
    const updateData = {
      userId: 1,
      date: "2025-07-27",
      doctorName: "Dr. Updated",
      diagnosis: "Cold",
      notes: "Take rest",
      weight: 60.5,
      systolic: 120,
      diastolic: 80,
    };

    // 1st call: update query
    mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });

    // 2nd call: getRecordById() result
    mockRequest.query.mockResolvedValueOnce({
      recordset: [
        {
          recordId: 1,
          ...updateData,
        },
      ],
    });

    const result = await recsModel.updateRecordById(1, updateData);
    expect(result).toEqual({ recordId: 1, ...updateData });

    expect(mockRequest.input).toHaveBeenCalledWith("id", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("notes", sql.NVarChar(100), updateData.notes);
    expect(mockRequest.input).toHaveBeenCalledWith("weight", sql.Float, 60.5);
    expect(mockRequest.input).toHaveBeenCalledWith("systolic", sql.Int, 120);
    expect(mockRequest.input).toHaveBeenCalledWith("diastolic", sql.Int, 80);
  });

  test("returns null if record not found", async () => {
    // 1st call: update query returns no affected rows
    mockRequest.query.mockResolvedValueOnce({ rowsAffected: [0] });

    const result = await recsModel.updateRecordById(999, {});
    expect(result).toBeNull();
  });
});

  // Test DELETE record by Id
  describe("deleteRecordById", () => {
    test("deletes record and returns 1", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
      const result = await recsModel.deleteRecordById(1);
      expect(result).toBe(1);
      expect(mockRequest.input).toHaveBeenCalledWith("id", sql.Int, 1);
    });

    test("returns 0 if record not found", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [0] });
      const result = await recsModel.deleteRecordById(999);
      expect(result).toBe(0);
    });
  });
});
