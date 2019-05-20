-- Select all employees
SELECT * FROM Employees;

-- select an employee
SELECT * FROM Employees WHERE Employees.ID = :ID;

-- create an employee
INSERT INTO Employees 
(First_Name, Last_Name, Salary, Employee_Type, Department) 
VALUES (:First_Name, :Last_Name, :Salary, :Employee_Type, :Department);

-- update an employee
UPDATE Employees 
SET Salary = :Salary WHERE Employees.ID = :ID;

-- delete an employee
DELETE FROM Employees WHERE Employees.ID = :ID;

-- Select all patients
SELECT * FROM Patients;

-- select a patient
SELECT * FROM Patients WHERE Patients.ID = :ID;

-- create a patient
INSERT INTO Patients 
(First_Name, Last_Name, DOB, Insured, Cheif_Complaint) 
VALUES (:First_Name, :Last_Name, :DOB, :Insured, :Cheif_Complaint);

-- update a patient
UPDATE Patients 
SET Insured = :Insured WHERE Patients.ID = :ID;

-- delete a patient
DELETE FROM Patients WHERE ID=:id;

-- add doctor to patient
INSERT INTO Doctor_Patient 
(Employee_ID, Patient_ID) VALUES (:Employee_ID, :Patient_ID);

-- delete a patient-treatment relationship
DELETE FROM Patient_Treatment
WHERE Patient_Treatment.Patient_ID = :Patient_ID
AND Patient_Treatment.Treatment_ID = :Treatment_ID;

-- delete a patient-doctor relationship
DELETE FROM Doctor_Patient
WHERE Doctor_Patient.Employee_ID = :Employee_ID
AND Doctor_Patient.Patient_ID = :Patient_ID;



-- fixes for part 3 final --
 -- insert Department
INSERT INTO Department
(Department_Name, Budget) VALUES (:Department_Name, :Budget);

 -- insert Employee_Type
INSERT INTO Employee_Type
(Employee_Type) VALUES (:Employee_Type);

 -- insert Treatments
INSERT INTO Treatments
(Treatment_Types, Insurance_covers, Insured_Price, Uninsured_Price) 
VALUES (:Treatment_Types, :Insurance_covers, :Insured_Price, :Uninsured_Price);

-- insert Patient_Treatment
INSERT INTO Patient_Treatment
(Patient_ID, Treatment_ID) 
VALUES (:Patient_ID, Treatment_ID);

-- select Patient_Treatment
SELECT * FROM Patient_Treatment;
-- select Doctor_Patient
SELECT * FROM Doctor_Patient;
-- select Department
SELECT * FROM Department;
SELECT * FROM Department WHERE ID=:id;
-- OR
SELECT * FROM Department WHERE Department_Name LIKE '%:dept_name%';
-- select Employee_Type
SELECT * FROM Employee_Type;
-- select Patients
SELECT * FROM Patients;
SELECT * FROM Patients WHERE ID=:id;

-- select All of a patients doctors
select e.First_Name, e.Last_Name from patients p 
inner join Doctor_Patient dp ON p.ID = dp.Patient_ID 
inner join Employees e ON dp.Employee_id=e.ID
WHERE p.ID=:id;

-- select all of a patients treatments
select t.Treatment_Type from Patients p 
inner join Patient_Treatment pt ON p.ID=pt.Patient_ID 
inner join Treatments t ON pt.Treatment_ID=t.id
WHERE p.ID=:id;

-- search for patient (in seachr bar) query
select ID, First_Name, Last_Name from Patients
WHERE First_Name LIKE '%:search%'
OR Last_Name LIKE '%:search%';

-- Delete Department
DELETE FROM Department WHERE Department.ID = :ID;
-- Delete Employee_Type
DELETE FROM Employee_Type WHERE Employee_Type.ID = :ID;
-- Delete Treatment many to many with patients
DELETE FROM Treatment WHERE Treatment.ID = :ID;