var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Connect to database
var mysql = require('./db_info.js');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port',3000);

app.use(express.static(__dirname + '/public'));

// Home page
app.get('/', function(req,res){
  res.render('home')
});
// get all employees
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
// get specific employee
app.get('/allemployees/id=:id', function(req, res){
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

app.use(function(req, res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'),function(){
  console.log("Server is running...")
});
