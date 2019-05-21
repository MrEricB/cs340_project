module.exports = function(){
    var express = require('express');
    var app = express();
    var router = express.Router();
    //function for requesting limited info of all employees 
    function getEmployees(res, mysql, context, complete){
        var query = "SELECT Employees.First_Name, Employees.Last_Name, Employees.ID, Department.Department_Name AS Department_Name FROM Employees INNER JOIN Department ON Employees.Department_ID = Department.ID";
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employees = results;
            complete();
        })
    }

    //function for requesting all info of individual employee
    function getIndividualEmployee(res, mysql, context, id, complete){
        var query = "SELECT First_Name, Last_Name, Department.Department_Name AS Department_Name, Employee_Type.Employee_Type as Employee_Type, Salary FROM Employees INNER JOIN Department ON Employees.Department_ID = Department.ID INNER JOIN Employee_Type ON Employees.Employee_Type_ID = Employee_Type.ID WHERE Employees.ID = ?";
        var inserts = [id];
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employee = results[0];
            complete();
        })
    }

    //function for requesting an individual employee's patient info
    function getEmployeePatients(res, mysql, context, id, complete){
        var query = "SELECT Patients.First_Name, Patients.Last_Name, Patients.ID FROM Employees INNER JOIN Doctor_Patient ON Employees.ID = Doctor_Patient.Employee_ID INNER JOIN Patients ON Doctor_Patient.Patient_ID = Patients.ID WHERE Employees.ID = ?";
        var inserts = [id];
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.patients = results;
            complete();
        })
    }

    //function for requesting all employee types for listing in addEmployee form
    function getEmployeeTypes(res, mysql, context, complete){
        mysql.pool.query("SELECT ID, Employee_Type FROM Employee_Type", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employee_types = results;
            complete();
        });
    }

    //function for requesting all department names for listing in addEmployee form
    function getDepartments(res, mysql, context, complete){
        mysql.pool.query("SELECT ID, Department_Name FROM Department", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.departments = results;
            complete();
        })
    }

    //get request for all employee info for SHHViewAllEmployees
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getEmployees(res, mysql, context, complete);
        getEmployeeTypes(res, mysql, context, complete);
        getDepartments(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >=3){
                res.render('SHHViewAllEmployees', context);
            }
        }
    });

    //get request for an individual employee's info for SHHViewIndividualEmployee
    router.get('/id=:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getIndividualEmployee(res, mysql, context, req.params.id, complete);
        getEmployeePatients(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >=2){
                //console.log(context);
                res.render('SHHViewIndividualEmployee', context);
            }
        }
    });

    //post request to create a new employee in SHHViewAllEmployees
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Employees (First_Name, Last_Name, Salary, Employee_Type_ID, Department_ID) VALUES (?,?,?,?,?)";
        var inserts = [req.body.First_Name, req.body.Last_Name, req.body.Salary, req.body.Employee_Type_ID, req.body.Department_ID];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/employees');
            }
        });
    });

    return router;
}();
