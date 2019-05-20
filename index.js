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
    // console.log(context);
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
    // console.log(context.results)
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
    context.id = id;
    console.log(context.results);
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
    context.id = id;
    res.render('patientsDoctors', context);
  });
});

/** Add treatment to patient **/
app.get('/addTreatment/id=:id', function(req, res){
  var id = req.params.id;
  var sql = "SELECT * FROM Treatments" 
  var context = {};
  context.id = id;
  mysql.pool.query(sql,[id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
      test = JSON.stringify(rows);
      test = JSON.parse(test);
      context.treatments = test;
      res.render('addTreatment', context)
      });
  });

app.post('/addTreatment/id=:id', function(req, res){
  console.log(req.body);
  var pid = req.params.id;
  var tid = req.body.treatment;
  console.log(pid, tid);
  var sql = "INSERT INTO `Patient_Treatment` (`Patient_ID`, `Treatment_ID`) VALUES (?,?)";
  // insert in new treatment for patient
  mysql.pool.query(sql,[pid, tid], function(err, rows){
    if(err){
      next(err);
      return;
    }
    
    res.redirect('/patients')
  });



});

/** Add doctor to patient **/
app.get("/addDoctor/id=:id", function(req, res){
  var id = req.params.id;
  var sql = "SELECT e.ID,e.First_Name,e.Last_Name,et.Employee_Type FROM Employees e INNER JOIN Employee_Type et ON e.Employee_Type_ID=et.ID WHERE et.Employee_Type='Doctor'"
  var context = {};
  context.pid = id;
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
      test = JSON.stringify(rows);
      test = JSON.parse(test);
      context.doctors = test;
      // console.log(context);
      res.render('addDoctor', context)
      });
});

app.post('/addDoctor/id=:id', function(req, res){
  var pid = req.body.patient;
  var eid = req.body.doctor;

  //insert into the database
  var sql = "INSERT INTO `Doctor_Patient` (`Employee_ID`, `Patient_ID`) VALUES (?,?);";
  mysql.pool.query(sql,[eid, pid], function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/patients/id='+pid);
  });

});

/** Adding a patient **/
app.get('/createPatient', function(req, res){
  var context = {}
  //need to pass all doctors
  var sql_1 = "SELECT * FROM Employees INNER JOIN Employee_Type ON Employees.Employee_Type_ID = Employee_Type.ID INNER JOIN Department ON Employees.Department_ID = Department.ID WHERE Employee_Type.Employee_Type='Doctor'"
  var sql_2 = "SELECT * FROM Treatments"
  mysql.pool.query(sql_1, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.doctors = test;
    
    mysql.pool.query(sql_2, function(err, rows, feilds){
      if(err){
        next(err);
        return;
      }
      test = JSON.stringify(rows);
      test = JSON.parse(test);
      context.treatments = test;
      res.render('createPatient', context);
    });
  });
});
app.post('/patients', function(req, res){
  var First_Name = req.body.firstname;
  var Last_Name = req.body.lastname;
  var DOB = req.body.dob;
  var Chief_Complaint = req.body.chiefcomplaint;
  var Insured;
  if(req.body.insured == "Yes"){
    Insured = '1';
  } else {
    Insured = '0'
  }
  //insert into the database
  var sql = "INSERT INTO `Patients` (`ID`,`First_Name`, `Last_Name`, `DOB`, `Insured`, `Chief_Complaint`) VALUES (NULL,?,?,?,?,?)";
  mysql.pool.query(sql,[First_Name,Last_Name,DOB,Insured,Chief_Complaint], function(err, rows){
    if(err){
      next(err);
      return;
    }
    
    res.redirect('/patients')
  });

});


// create employee
app.get('/createEmployee', function(req, res){
  var context = {}
  //need to pass all doctors
  var sql_1 = "SELECT * FROM Employees"
  var sql_2 = "SELECT * FROM Employee_Type"
  var sql_3 = "SELECT * FROM Department"

  mysql.pool.query(sql_1, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;

    mysql.pool.query(sql_2, function(err, rows, feilds){
      if(err){
        next(err);
        return;
      }
      test = JSON.stringify(rows);
      test = JSON.parse(test);
      context.employee_type = test;

      mysql.pool.query(sql_3, function(err, rows, feilds){
        if(err){
          next(err);
          return;
        }
        test = JSON.stringify(rows);
        test = JSON.parse(test);
        context.department = test;
        res.render('createEmployee', context);
      });
    });
  });
});

app.post('/createEmployee', function(req, res){
  var First_Name = req.body.firstname;
  var Last_Name = req.body.lastname;
  var Salary = req.body.salary;
  var Department = req.body.department;
  var Employee_Type = req.body.employee_type;

  console.log(req.body);
  //insert into the database
  var sql = "INSERT INTO `Employees` (`First_Name`, `Last_Name`, `Salary`, `Employee_Type_ID`, `Department_ID`) VALUES (?,?,?,?,?)";
  mysql.pool.query(sql,[First_Name,Last_Name,Salary,Department,Employee_Type], function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/employees')
  });

});

// create Treatment
app.get('/createTreatment', function(req, res){
  res.render('createTreatment');
});

app.post('/createTreatment', function(req, res){
  var Treatment_Type = req.body.treatment_type;
  var Insurance_covers = req.body.insurance_cover;
  var Insurance_Price = req.body.insurance_price;
  var Uninsured_Price = req.body.uninsurance_price;

  console.log(req.body);
  //insert into the database
  var sql = "INSERT INTO `Treatments` (`Treatment_Type`, `Insurance_covers`, `Insured_Price`, `Uninsured_Price`) VALUES (?,?,?,?)";
  mysql.pool.query(sql,[Treatment_Type, Insurance_covers, Insurance_Price, Uninsured_Price], function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/treatments');
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
app.get('/employee_types', function(req, res){
  var context = {};
  var sql = "SELECT * FROM Patient_Treatment"
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
