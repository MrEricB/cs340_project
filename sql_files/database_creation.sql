-- testing --
DROP TABLE IF EXISTS Patient_Treatment;
DROP TABLE IF EXISTS Doctor_Patient;
DROP TABLE IF EXISTS Treatments;
DROP TABLE IF EXISTS Patients;
DROP TABLE IF EXISTS Employees;
DROP TABLE IF EXISTS Department;
DROP TABLE IF EXISTS Employee_Type;


-- end testing --
CREATE TABLE Employee_Type (
    ID int NOT NULL AUTO_INCREMENT,
    Employee_Type varchar(255) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE Department (
    ID int NOT NULL AUTO_INCREMENT,
    Department_Name varchar(255) NOT NULL,
    Budget int NOT NUll,
    PRIMARY KEY (ID)
);

CREATE TABLE Employees (
    ID int NOT NULL AUTO_INCREMENT,
    First_Name varchar(255) NOT NULL,
    Last_Name varchar(255) NOT NULL,
    Salary int NOT NULL,
    Employee_Type_ID int, -- can be null, will be null when their eployee_type is deleteted in employee_type table
    Department_ID int NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (Employee_Type_ID) REFERENCES Employee_Type(ID) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (Department_ID) REFERENCES Department(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Patients (
    ID int NOT NULL AUTO_INCREMENT,
    First_Name varchar(255) NOT NULL,
    Last_Name varchar(255) NOT NULL,
    DOB date NOT NULL,
    Insured tinyint(1) NOT NULL DEFAULT 0,
    Chief_Complaint varchar(255) NOT NULL,
    Treatment_Paid tinyint(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (ID)
);

CREATE TABLE Treatments (
    ID int NOT NULL AUTO_INCREMENT,
    Treatment_Type varchar(255) NOT NULL,
    Insurance_covers tinyint(1) NOT NULL,
    Insured_Price int(11) NOT NULL,
    Uninsured_Price int(11) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE Patient_Treatment (
    Patient_ID int NOT NULL,
    Treatment_ID int NOT NULL,
    PRIMARY KEY (Patient_ID,Treatment_ID),
    FOREIGN KEY (Patient_ID) REFERENCES Patients(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Treatment_ID) REFERENCES Treatments(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Doctor_Patient (
    Employee_ID int NOT NULL,
    Patient_ID int NOT NULL,
    PRIMARY KEY (Employee_ID, Patient_ID),
    FOREIGN KEY (Employee_ID) REFERENCES Employees(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES Patients(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO Employee_Type (Employee_Type) 
VALUES ('Administrator'), ('Doctor'), ('Nurse'), ('Physical Therapist'), ('Surgeon');

INSERT INTO Department (Department_Name, Budget) 
VALUES ('Administration', 250000), ('General Medicine', 5000000), ('Physical Therapy', 250000), ('Surgery', 3500000), ('Oncology', 5000000);

INSERT INTO Employees (First_Name, Last_Name, Salary, Employee_Type_ID, Department_ID) 
VALUES ('Frank', 'Smith', 250000, 2, 2), ('Jeff', 'Carlson', 85000, 3, 4), ('Sarah', 'Jones', 500000, 5, 5), ('Ben', 'Moore', 125000, 2, 2);

INSERT INTO Patients (First_Name, Last_Name, DOB, Insured, Chief_Complaint, Treatment_Paid) 
VALUES ('Mike', 'Smithy', date '1958-05-01', 1, 'Broken Leg', 0), ('Jessica', 'Larson', date '1985-05-08', 1, 'Neck Pain', 1), ('Bill', 'Billson', date '1995-05-08', 1, 'Flu like symptoms', 1);

INSERT INTO Treatments (Treatment_Type, Insurance_covers, Insured_Price, Uninsured_Price) 
VALUES ('Doctor Visit', 1, 25, 300), ('Surgery', 1, 15000, 65000), ('PT', 1, 45, 500), ('MRI', 1, 25, 250);

INSERT INTO Patient_Treatment (Patient_ID, Treatment_ID) 
VALUES (3, 1), (3, 3), (2, 4), (1, 2);

INSERT INTO Doctor_Patient (Employee_ID, Patient_ID) 
VALUES (4, 3), (1, 2), (3, 2), (1, 1);
