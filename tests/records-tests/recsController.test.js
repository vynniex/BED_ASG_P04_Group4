const recsController = require("../../records-api-xuening/controllers/recsController");
const recsModel = require("../../records-api-xuening/models/recsModel");

jest.mock("../../records-api-xuening/models/recsModel");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // allow chaining
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Records Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test GET all records
  test("getAllRecords - success", async () => {
    const req = { user: { id: 1 } };
    const res = mockResponse();
    const mockRecords = [{ recordId: 1 }, { recordId: 2 }];
    recsModel.getRecordsByUserId.mockResolvedValue(mockRecords);

    await recsController.getAllRecords(req, res);

    expect(res.json).toHaveBeenCalledWith(mockRecords);
  });

  // Test GET record by Id
  test("getRecordById - success", async () => {
    const req = { params: { id: "1" }, user: { id: 2 } };
    const res = mockResponse();
    const mockRecord = { recordId: 1, userId: 2 };
    recsModel.getRecordById.mockResolvedValue(mockRecord);

    await recsController.getRecordById(req, res);

    expect(res.json).toHaveBeenCalledWith(mockRecord);
  });

  test("getRecordById - invalid id", async () => {
    const req = { params: { id: "abc" }, user: { id: 2 } };
    const res = mockResponse();

    await recsController.getRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid record ID" });
  });

  test("getRecordById - not found", async () => {
    const req = { params: { id: "99" }, user: { id: 2 } };
    const res = mockResponse();
    recsModel.getRecordById.mockResolvedValue(null);

    await recsController.getRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Record not found" });
  });

  // Test POST a new record
  test("createRecord - success", async () => {
    const req = {
      user: { id: 1 },
      body: {
        date: "2025-07-26",
        doctorName: "Dr. A",
        diagnosis: "Fever",
        notes: null,
        weight: 65.5,
        systolicBP: 120,
        diastolicBP: 80
      },
    };
    const res = mockResponse();
    recsModel.isDuplicateDate.mockResolvedValue(false);
    recsModel.createRecord.mockResolvedValue({ recordId: 10, userId: 1, ...req.body });

    await recsController.createRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ recordId: 10, ...req.body });
  });

  test("createRecord - duplicate date", async () => {
    const req = {
      user: { id: 1 },
      body: {
        date: "2025-07-26",
      },
    };
    const res = mockResponse();
    recsModel.isDuplicateDate.mockResolvedValue(true);

    await recsController.createRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "A record for this date already exists." });
  });

  test("createRecord - missing body", async () => {
    const req = { user: { id: 2 } };
    const res = mockResponse();

    await recsController.createRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing record data" });
  });

  // Test UPDATE record by recordId
  test("updateRecordById - success", async () => {
    const req = {
      user: { id: 2 },
      params: { id: "1" },
      body: {
        date: "2025-07-26",
        doctorName: "Updated",
        diagnosis: "Cold",
        notes: "New notes",
        weight: 70,
        systolicBP: 125,
        diastolicBP: 85
      },
    };
    const res = mockResponse();
    recsModel.getRecordById.mockResolvedValue({ recordId: 1, userId: 2 });
    recsModel.isDuplicateDate.mockResolvedValue(false);
    recsModel.updateRecordById.mockResolvedValue({ recordId: 1, userId: 2, ...req.body });

    await recsController.updateRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ recordId: 1, ...req.body });
  });

  test("updateRecordById - duplicate", async () => {
    const req = {
      user: { id: 1 },
      params: { id: "1" },
      body: { userId: 1, date: "2025-07-26" },
    };
    const res = mockResponse();
    recsModel.getRecordById.mockResolvedValue({ recordId: 1, userId: 1 });
    recsModel.isDuplicateDate.mockResolvedValue(true);

    await recsController.updateRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Another record with this date already exists.",
    });
  });

  test("updateRecordById - not found", async () => {
    const req = {
      user: { id: 2 },
      params: { id: "1" },
      body: { userId: 1, date: "2025-07-26" },
    };
    const res = mockResponse();
    recsModel.getRecordById.mockResolvedValue(null);

    await recsController.updateRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Record not found" });
  });

  test("updateRecordById - invalid ID", async () => {
    const req = { user: { id: 1 }, params: { id: "-1" }, body: {} };
    const res = mockResponse();

    await recsController.updateRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid record ID" });
  });

  // Test DELETE record by Id
  test("deleteRecordById - success", async () => {
    const req = { user: { id: 1 }, params: { id: "1" } };
    const res = mockResponse();
    recsModel.getRecordById.mockResolvedValue({ recordId: 1, userId: 1 });
    recsModel.deleteRecordById.mockResolvedValue(1);

    await recsController.deleteRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Record deleted successfully" });
  });

  test("deleteRecordById - not found", async () => {
    const req = { user: { id: 1 }, params: { id: "999" } };
    const res = mockResponse();
    recsModel.deleteRecordById.mockResolvedValue(0);

    await recsController.deleteRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Record not found" });
  });

  test("deleteRecordById - invalid ID", async () => {
    const req = { user: { id: 1 }, params: { id: "" } };
    const res = mockResponse();

    await recsController.deleteRecordById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid record ID" });
  });
});
