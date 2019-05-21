module.exports = function(){
    var express = require('express');
    var app = express();
    var router = express.Router();
    
    //function for requesting all patient info
    function getPatients(res, mysql, context, complete){
        var sql = "SELECT First_Name, Last_Name, ID, Chief_Complaint FROM Patients";
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            //console.log(results);
            context.patients = results;
            complete();
        });
    }

    //function for requesting an individual patient's info
    function getIndividualPatient(res, mysql, context, id, complete){
        var query = "SELECT * FROM Patients WHERE Patients.ID = ?";
        var inserts = [id];
        mysql.pool.query(query, inserts, function(error, results, fields){
            if (error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.patient = results[0];
            complete();
        })
    }

    //function for requesting an individual patients's treatment info
    function getPatientTreatments(res, mysql, context, id, complete){
        var query = "SELECT Treatments.Treatment_Type, Treatments.ID FROM Patients INNER JOIN Patient_Treatment ON Patients.ID = Patient_Treatment.Patient_ID INNER JOIN Treatments ON Patient_Treatment.Treatment_ID = Treatments.ID WHERE Patients.ID = ?";
        var inserts = [id];
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.treatments = results;
            complete();
        })
    }

    //function for requesting an individual patient's doctors info
    function getPatientDoctors(res, mysql, context, id, complete){
        var query = "SELECT Employees.First_Name, Employees.Last_Name, Employees.ID FROM Patients INNER JOIN Doctor_Patient ON Patients.ID = Doctor_Patient.Patient_ID INNER JOIN Employees ON Doctor_Patient.Employee_ID = Employees.ID WHERE Patients.ID = ?";
        var inserts = [id];
        mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.doctors = results;
            complete();
        })
    }

    //get request for all patient info for SHHViewAllPatients
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPatients(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >=1){
                res.render('SHHViewAllPatients', context);
            }
        }      
    });

    //get request for an individual patient's info for SHHViewIndividualPatient
    router.get('/id=:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getIndividualPatient(res, mysql, context, req.params.id, complete);
        getPatientTreatments(res, mysql, context, req.params.id, complete);
        getPatientDoctors(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                console.log(context);
                res.render('SHHViewIndividualPatient', context);
            }
        }
    });

    //post request to create a new patient in SHHViewAllPatients
    router.post('/', function(req, res){
        //console.log(req.body);
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Patients (First_Name, Last_Name, DOB, Insured, Chief_Complaint) VALUES (?,?,?,?,?)";
        var inserts = [req.body.First_Name, req.body.Last_Name, req.body.DOB, req.body.Insured, req.body.Chief_Complaint];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/patients');
            }
        });
    });

    //get request to display a patient's info for updating
    router.get('/update/id=:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectInsured.js", "selectPaid.js", "updatePatient.js"];
        var mysql = req.app.get('mysql');
        getIndividualPatient(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-person', context);
            }
        }
    });

    return router;
}();
