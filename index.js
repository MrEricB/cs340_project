var express = require('express');
var mysql = require('./db_info.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var path = require('path');
var router = express.router();

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.use('/', express.static('public'));
app.use(express.static(__dirname + '/public'));
const publicPath = path.join(__dirname, '../public');
app.use('/', express.static(publicPath));

// Home page
app.get('/', function(req,res){
  res.render('home')
});

//function request for all patient info
function getPatients(res, mysql, context){
  var query = "SELECT Patient.First_Name, Patient.Last_Name, Patient.ID, Patient.Chief_Complaint FROM Patients";
  mysql.pool.query(query, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.patients = results;
  });
}

//function request for individual patient's info
function getIndividualPatient(req, res, mysql, context){
  var query = "SELECT * FROM Patients WHERE Patients.ID = ?";
  var inserts = [req.params.ID];
  mysql.pool.query(query, inserts, function(error, results, fields){
    if (error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.patient = results;
    complete();
  })
}

//function request for all employee info
function getEmployees(res, mysql, context){
  var query = "SELECT Employees.First_Name, Employees.Last_Name, Employees.ID, Department.Department_Name AS Department_Name FROM Employees INNER JOIN Department ON Employees.Department_ID = Department.ID";
  mysql.pool.query(query, function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.employees = results;
  })
}

//function request for individual employee's info
function getIndividualEmployee(req, res, mysql, context){
  var query = "SELECT Employees.First_Name, Employees.Last_Name, Department.Department_Name AS Department_Name, Employee.Employee_Type, Employee.Salary FROM Employees INNER JOIN Department ON Employees.Department_ID = Department.ID WHERE Employees.ID = ?";
  var inserts = [req.params.ID];
  mysql.pool.query(query, inserts, function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.employee = results;
    complete();
  })
}

//function request for an individual patients's treatment info
function getPatientTreatments(res, mysql, context){
  var query = "SELECT Treatments.Treatment_Type, Treatments.ID FROM Patients INNER JOIN Patinet_Treatment ON Patients.ID = Patient_Treatment.ID INNER JOIN Treatments ON Patient_Treatment.ID = Treatments.ID WHERE Patients.ID = ?";
  var inserts = [req.params.ID];
  mysql.pool.query(query, inserts, function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.treatments = results;
    complete();
  })
}

//function request for an individual patient's doctors info
function getPatientDoctors(res, mysql, context){
  var query = "SELECT Employees.First_Name, Employees.Last_Name, Employees.ID FROM Patients INNER JOIN Doctor_Patient ON Patients.ID = Doctor_Patient.Patient_ID INNER JOIN Employees ON Doctor_Patient.Employee_ID = Employees.ID WHERE Patients.ID = ?";
  var inserts = [req.params.ID];
  mysql.pool.query(query, inserts, function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.doctors = results;
    complete();
  })
}

//function request for an individual employee's patient info
function getEmployeePatients(res, mysql, context){
  var query = "SELECT Patients.First_Name, Patients.Last_Name, Patients.ID FROM Employees INNER JOIN Doctor_Patient ON Employees.ID = Doctor_Patient.Employee_ID INNER JOIN Patients ON Doctor_Patient.Patient_ID = Patients.ID WHERE Employees.ID = ?";
  var inserts = [req.params.ID];
  mysql.pool.query(query, inserts, function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.patients = results;
    complete();
  })
}

//get request for all patient info for SHHViewAllPatients
router.get('/patients', function(req, res){
  var context = {};
  var mysql = req.app.get('mysql');
  getPatients(res, mysql, context);
  res.render('SHHViewAllPatients', context);
});

//get request for all employee info for SHHViewAllEmployees
router.get('/employees', function(req, res){
  var context = {};
  var mysql = req.app.get('mysql');
  getEmployees(res, mysql, context);
  res.render('SHHViewAllEmployees', context);
});

//get request for an individual patient's info for SHHViewIndividualPatient
router.get('/patients/id=:id', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getIndividualPatient(res, mysql, context, complete);
  getPatientTreatments(res, mysql, context, complete);
  getPatientDoctors(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 3){
      res.render('SHHViewIndividualPatient', context);
    }
  }
});

//get request for an individual employee's info for SHHViewIndividualEmployee
router.get('/employees/id=:id', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getIndividualEmployee(res, mysql, context, complete);
  getEmployeePatients(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >=2){
      res.render('SHHViewIndividualEmployee', context);
    }
  }
});


/*
router.get('/', function(req, res){
  var callbackCount = 0;
  var context = {};
  context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
  var mysql = req.app.get('mysql');
  getPeople(res, mysql, context, complete);
  getPlanets(res, mysql, context, complete);
  function complete(){
      callbackCount++;
      if(callbackCount >= 2){
          res.render('people', context);
      }

  }
});
*/

// get all employees
/*
app.get('/employees', function(req, res){
  var context = {};
  var sql = "SELECT * FROM Employees INNER JOIN Department ON Employees.Department_ID = Department.ID"
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    res.render('SHHViewAllEmployees', context);
  });
});
*/

// get specific employee
app.get('/employees/id=:id', function(req, res){
  var id = req.params.id;
  var sql = "SELECT * FROM Employees INNER JOIN Employee_Type ON Employees.Employee_Type_ID = Employee_Type.ID INNER JOIN Department ON Employees.Department_ID = Department.ID WHERE Employees.ID=(?)"  
  var context = {};
  mysql.pool.query(sql,[id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
    res.render('SHHViewIndividualEmployee', context);
  });

});
// get all patients
app.get('/patients', function(req, res){
  var context = {};
  var sql = "SELECT * FROM Patients"
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    console.log(context);
    res.render('SHHViewAllPatients', context);
  });
});

/*
// get specific patient
// TODO: need to fix in mustache file where insured is 1 or 0 should be yes or no, same with paid
app.get('/patients/id=:id', function(req, res){
  var id = req.params.id;
  var sql = "SELECT * FROM Patients WHERE ID=(?)"  
  var context = {};
  mysql.pool.query(sql,[id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
    res.render('SHHViewIndividualPatient', context)
  });
});
*/

// get all treatments
app.get('/treatments', function(req, res){
  var context = {};
  var sql = "SELECT * FROM Treatments"
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    console.log(context);
    res.render('SHHViewAllTreatments', context); 
  });
});

// get all treatments for a specific patient
/*
app.get('/patients/treatments/id=:id&name=:name', function(req, res){
  var id = req.params.id;
  var name = req.params.name;
  var sql = "SELECT t.Treatment_Type, t.Insured_Price, t.Uninsured_Price FROM Patients p INNER JOIN Patient_Treatment pt ON p.ID=pt.Patient_ID INNER JOIN Treatments t ON pt.Treatment_ID=t.id WHERE p.ID=(?)"  
  var context = {};
  mysql.pool.query(sql,[id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    context.name = name;
    res.render('patientsTreatments', context);
  });
});
*/

/*
// get all doctors for a specific patient
app.get('/patients/doctors/id=:id&name=:name', function(req, res){
  var id = req.params.id;
  var name = req.params.name;
  var sql = "SELECT e.First_Name, e.Last_Name, d.Department_Name FROM Patients p INNER JOIN Doctor_Patient dp ON p.ID = dp.Patient_ID INNER JOIN Employees e ON dp.Employee_id=e.ID INNER JOIN Department d ON e.Department_ID=d.ID WHERE p.ID=(?)"  
  var context = {};
  mysql.pool.query(sql,[id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    context.name = name;
    res.render('patientsDoctors', context);
  });
});
*/

//Don't know if we need this?
// get all employee_types
app.get('/employee_types', function(req, res){
  var context = {};
  var sql = "SELECT * FROM Employee_Type"
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    console.log(context);
    res.render('SHHViewAllEmployeeType', context); 
  });
});

//Don't know if we need this?
// get all patient_treaments

//Don't know if we need this?
// get all doctor_patients

//Don't know if we need this?
// get all departments

//Don't know if we need this?
// get specific department

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
