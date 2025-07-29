USE bed_asg1_db;

DROP TABLE IF EXISTS Records;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Users;

/* Login User info */
CREATE TABLE Users (
    userId INT PRIMARY KEY IDENTITY(1,1),
    nric_fin VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    contact_num VARCHAR(20) NOT NULL,
    dob DATE NOT NULL
);

INSERT INTO Users(nric_fin, full_name, email, password, contact_num, dob) VALUES
('S4512345D', 'Tan Mei Ling', 'meiling.tan@example.com', 'password1', '91234567', '1945-08-15'),
('S9988776A', 'Lim Wei Jie', 'weijie.lim@example.com', 'password2', '98765432', '1943-12-09');

/* Xin YI */
CREATE TABLE Medications (
    medicine_id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL, -- Foreign key to Users table
    medicine_name VARCHAR(100) NOT NULL UNIQUE,
    purpose VARCHAR(200) NOT NULL,
    per_day INT NOT NULL CHECK(per_day > 0),
    food_timing VARCHAR(10) NOT NULL CHECK(food_timing IN ('before', 'after')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL
);

INSERT INTO Medications (medicine_id, userId, medicine_name, purpose, per_day, food_timing, created_at)
(1, 1, 'Aspirin', 'Pain Relief', 2, 'before', GETDATE())
/* Grace */ 
CREATE TABLE Appointments (
    appointment_id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,  -- Foreign key to Users table
    nric_fin VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    contact_num VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(15) NOT NULL,
    clinic VARCHAR(100) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(userId)  ON DELETE CASCADE -- Delete data if User is deleted
);

INSERT INTO Appointments (userId, nric_fin, full_name, email, contact_num, dob, appointment_date, appointment_time, clinic, reason)
VALUES (1, 'S4512345D', 'Tan Mei Ling', 'meiling.tan@example.com', '91234567', '1945-08-15', '2025-07-01', '9:00 AM', 'Outram Polyclinic', 'General Consultation');

/* Xue Ning */
CREATE TABLE Records (
    recordId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL, -- Foreign key to Users table 
    date DATE NOT NULL,
    doctorName NVARCHAR(100) NOT NULL, 
    diagnosis NVARCHAR(255) NOT NULL, 
    notes NVARCHAR(100) NULL,
    systolic INT NULL,
    diastolic INT NULL,
    bloodSugar INT NULL,
    weight FLOAT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId)  ON DELETE CASCADE -- Delete data if User is deleted
);

INSERT INTO Records (userId, date, doctorName, diagnosis, notes, systolic, diastolic, bloodSugar, weight)
VALUES 
(1, '2025-07-25', 'Dr. Tan Wei Ming', 'High blood pressure', 'Monitor blood pressure every morning', 140, 90, NULL, NULL),
(2, '2025-07-24', 'Dr. Siti Rahimah', 'Type 2 Diabetes', 'Avoid sugary drinks', NULL, NULL, 180, NULL),
(1, '2025-07-20', 'Dr. Alex Ng', 'Knee pain', 'Apply ice pack if swelling continues', NULL, NULL, NULL, 75.5);

/* Dalton */
