USE bed_asg1_db;
/* Xin YI */

/* Grace */ 

/* Xue Ning */
DROP TABLE IF EXISTS Records;

CREATE TABLE Records (
    recordId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL, -- Foreign key to Users table [LATER]
    date DATE NOT NULL,
    doctorName NVARCHAR(100) NOT NULL, 
    diagnosis NVARCHAR(255) NOT NULL, 
    notes NVARCHAR(100) NULL
);

INSERT INTO Records (userId, date, doctorName, diagnosis, notes)
VALUES 
(1, '2025-07-25', 'Dr. Tan Wei Ming', 'High blood pressure', 'Monitor blood pressure every morning'),
(2, '2025-07-24', 'Dr. Siti Rahimah', 'Type 2 Diabetes', 'Avoid sugary drinks'),
(1, '2025-07-20', 'Dr. Alex Ng', 'Knee pain',  'Apply ice pack if swelling continues');

SELECT * FROM Records;

/* Dalton */
