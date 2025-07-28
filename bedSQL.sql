USE bed_asg1_db;

DROP TABLE IF EXISTS Records;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Users;

/* Login User info */
CREATE TABLE Users (
    userId INT PRIMARY KEY IDENTITY(1,1),
    nric_fin VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

INSERT INTO Users (nric_fin, full_name, password_hash)
VALUES 
('S1234567A', 'Alex Tan', 'hash1'),
('T2345678B', 'Jamie Lim', 'hash2');

/* Xin YI */

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
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

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
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

INSERT INTO Records (userId, date, doctorName, diagnosis, notes, systolic, diastolic, bloodSugar, weight)
VALUES 
(1, '2025-07-25', 'Dr. Tan Wei Ming', 'High blood pressure', 'Monitor blood pressure every morning', 140, 90, NULL, NULL),
(2, '2025-07-24', 'Dr. Siti Rahimah', 'Type 2 Diabetes', 'Avoid sugary drinks', NULL, NULL, 180, NULL),
(1, '2025-07-20', 'Dr. Alex Ng', 'Knee pain', 'Apply ice pack if swelling continues', NULL, NULL, NULL, 75.5);

/* Dalton */
