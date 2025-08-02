const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Create User
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `INSERT INTO Users (nric_fin, full_name, email, password, contact_num, dob)
    VALUES (@nric_fin, @full_name, @email, @password, @contact_num, @dob); SELECT SCOPE_IDENTITY() AS userId`;
    const request = connection.request();
    console.log("Test:" , userData);
    request.input("nric_fin", userData.nric);
    request.input("full_name", userData.fullName);
    request.input("email", userData.email);
    request.input("password", userData.password);
    request.input("contact_num", userData.contact);
    request.input("dob", userData.dob);
    const result = await request.query(query);

    const newUserId = result.recordset[0].userId;
    return newUserId;
  } catch (error) {
    console.error("Database error: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.error("Error closing database: ", err);
      }
    }
  }
}

// Find user by email
async function findUserByEmail(email) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT * FROM Users WHERE email = @email`;
    const request = connection.request();
    request.input("email", email);
    const result = await request.query(query);

    return result.recordset[0]; // Return all users with that name
  } catch(error) {
    console.error("Database error: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.error("Error closing database: ", err);
      }
    }
  }
}

// Find User by userId
async function findUserById(userId) {
let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT * FROM Users WHERE userId = @userId`;
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    return result.recordset[0]; // Return all users with that userId
  } catch(error) {
    console.error("Database error: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.error("Error closing database: ", err);
      }
    }
  }
}

// Update user by Id
async function updateUserById(userId, updatedData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Users
      SET full_name = @full_name,
          email = @email,
          contact_num = @contact_num,
          dob = @dob
      WHERE userId = @userId`;

    const request = connection.request();
    request.input("userId", userId);
    request.input("full_name", updatedData.fullName);
    request.input("email", updatedData.email);
    request.input("contact_num", updatedData.contact);
    request.input("dob", updatedData.dob);

    const result = await request.query(query);
    return result.rowsAffected[0];
  } catch (error) {
    console.error("Database error (updateUserById): ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing DB: ", err);
      }
    }
  }
}

// Delete User by Id
async function deleteUserById(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `Delete From Users where userId = @userId`;
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    return result.rowsAffected[0];
  } catch(error) {
    console.error("Error in Delete /users: ", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(closeError){
        console.error("Error closing database collection: ", closeError);
      }
    }
  }
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserById,
    deleteUserById
}