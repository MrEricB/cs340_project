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
//main patient page
app.get('/patienthome', function(req, res){
  res.render('patienthome')
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
app.get('/patients/id=:id', function(req, res){
  var id = req.params.id;
  var sql = "SELECT * FROM Patients WHERE ID=(?);" // gets all patients info
  // get all patients doctors
  var sql_2 = "SELECT e.ID, e.First_Name, e.Last_Name, d.Department_Name, p.ID as PID FROM Patients p INNER JOIN Doctor_Patient dp ON p.ID = dp.Patient_ID INNER JOIN Employees e ON dp.Employee_id=e.ID INNER JOIN Department d ON e.Department_ID=d.ID WHERE p.ID=(?)"; 
  // get all patients treatments 
  var sql_3 = "SELECT t.ID, t.Treatment_Type, t.Insured_Price, t.Uninsured_Price, p.ID as PID FROM Patients p INNER JOIN Patient_Treatment pt ON p.ID=pt.Patient_ID INNER JOIN Treatments t ON pt.Treatment_ID=t.id WHERE p.ID=(?)"; 
  
  var context = {};
  // get patient
  mysql.pool.query(sql,[id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
    
    // get doctors
    mysql.pool.query(sql_2,[id], function(err, rows, feilds){
      if(err){
        next(err);
        return;
      }
      test = JSON.stringify(rows);
      test = JSON.parse(test);
      context.doctors = test;

      //get treatments
      mysql.pool.query(sql_3,[id], function(err, rows, feilds){
        if(err){
          next(err);
          return;
        }
        test = JSON.stringify(rows);
        test = JSON.parse(test);
        context.treatments = test;
        // console.log(context);
        res.render('SHHViewIndividualPatient', context);
      });
    });
  });
});
// Delete Patient
app.post('/deletePatient', function(req, res) {
  //DELETE FROM Patients WHERE ID=:id;
  var id = req.body.pid;
  sql = 'DELETE FROM Patients WHERE ID=(?)';
  mysql.pool.query(sql,[id],function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/patients');
  });

});
// edit patient
app.get('/editPatient/id=:id', function(req, res){
  var context = {};
  var id = req.params.id;
  var sql = "SELECT * FROM Patients WHERE ID=(?) LIMIT 1";
  mysql.pool.query(sql, [id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
    context.results.DOB = context.results.DOB.substring(0, 10);
    // console.log(context);
    res.render('editPatient', context)
  });

});
app.post('/editPatient', function(req, res){
  var id = req.body.pid;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var dob = req.body.dob;
  var complaint = req.body.chiefcomplaint;
  var insured = req.body.insured;
  var paid = req.body.paid;

  var sql = "UPDATE Patients SET First_Name=(?), Last_Name=(?), DOB=(?), Insured=(?), Chief_Complaint=(?), Treatment_Paid=(?)  WHERE Patients.ID = (?) LIMIT 1";
  mysql.pool.query(sql, [firstname,lastname,dob,insured, complaint, paid, id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    res.redirect('/patients');
  });

});


//search for patient
// get as post with render of all patients but change context
app.post('/patientSearch', function(req, res){
  var context = {};
  var searchName = req.body.patient.trim().split(" ");
  var fname = searchName[0];
  var lname = searchName[1] || "blank";
// var fname = 'Dave';
// var lname = 'Smith'
  var sql = "SELECT * from Patients WHERE First_Name LIKE '%" + fname + "%' OR Last_Name LIKE '%" + lname + "%' ";
  mysql.pool.query(sql, [fname, lname], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    console.log(fname, lname)
    res.render('SHHViewAllPatients', context);
  });
}); 

//remove treatment from patient
app.post('/removeTreatmentPatient/pid=:pid&tid=:tid', function(req, res){
  var pid = req.params.pid;
  var tid = req.params.tid;
  var sql = "DELETE FROM Patient_Treatment WHERE Patient_ID=(?) AND Treatment_ID=(?)";
  mysql.pool.query(sql, [pid,tid], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    res.redirect('/patients/id='+pid);
  });
});

//remove doctor from treatment
app.post('/removeDoctorPatient/pid=:pid&did=:did', function(req, res){
  var pid = req.params.pid;
  var did = req.params.did;
  var sql = "DELETE FROM Doctor_Patient WHERE Employee_ID=(?) AND Patient_ID=(?)";
  mysql.pool.query(sql, [did,pid], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    console.log(pid, did);
    res.redirect('/patients/id='+pid);
    // res.redirect('/');
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
    res.render('SHHViewAllTreatments', context); 
  });
});

app.get('/treatments/:id', function(req, res){
  var context = {};
  var id = req.params.id;
  var sql = "SELECT * FROM Treatments WHERE ID=?";
  mysql.pool.query(sql, [id], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
    console.log(context);
    res.render('individualTreatment', context); 
  });
});


// DELETE Treatment
app.post('/deleteTreatment', function(req, res){
  var tid = req.body.tid;
  var sql = "DELETE FROM Treatments WHERE ID=(?)";
  mysql.pool.query(sql,[tid],function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    res.redirect('/treatments');
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

//edit treatment
app.get('/editTreatment/id=:id', function(req, res){
  var context = {};
  var tid = req.params.id;
  sql ="SELECT * FROM Treatments WHERE ID=(?)";
  mysql.pool.query(sql,[tid], function(err, rows){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
    // console.log(context);
    res.render('editTreatment', context)
  });
});
app.post('/editTreatments', function(req, res){
  var treat_type = req.body.treatment_type;
  var insured = req.body.insurance_cover;
  var ins_price = req.body.insurance_price;
  var unins_price = req.body.uninsurance_price;
  var tid = req.body.tid;
  console.log(req.body);
  var sql = "UPDATE `Treatments` SET `Treatment_Type` = (?),`Insurance_covers`=(?), `Insured_Price`=(?), `Uninsured_Price`=(?) WHERE `Treatments`.`ID` = (?)";
  mysql.pool.query(sql, [treat_type, insured, ins_price, unins_price, tid], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    res.redirect('/treatments'); 
  });
})




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
    
    res.redirect('/patients/id='+pid);
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


// main hosptial page
app.get('/hostpitalManagment', function(req, res){
 res.render('hostpitalManagment');
});
// get all employees
app.get('/employees', function(req, res){
  var context = {};
  var sql = "SELECT e.ID, e.First_Name, e.Last_Name, d.Department_Name FROM Employees e INNER JOIN Department d ON e.Department_ID=d.id"
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    // console.log(context);
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
  mysql.pool.query(sql,[First_Name,Last_Name,Salary,Employee_Type, Department], function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/employees')
  });

});
// Delete Employee
app.post('/deleteEmployee', function(req, res){
  var eid = req.body.eid;
  var sql = "DELETE FROM Employees WHERE ID=(?)";
  mysql.pool.query(sql,[eid],function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    console.log(eid);
    res.redirect('/employees');
  });
});

/** NOT WORKING REMOVE SINCE IT IS NOT NEEDED **/
/*
// edit employee
app.get('/editEmployee/id=:id', function(req, res){
  var context = {};
  var eid = req.params.id;
  var sql_1 ="SELECT e.ID, e.First_Name, e.Last_Name, e.Salary, e.Employee_Type_ID, e.Department_ID, d.Department_Name, et.Employee_Type , d.ID as did, et.id as etid FROM Employees e INNER JOIN Department d ON e.Department_ID=d.ID INNER JOIN Employee_Type et ON e.Employee_Type_ID=et.ID WHERE e.ID=(?)";
  var sql_2 = "SELECT * FROM Employee_Type"
  var sql_3 = "SELECT * FROM Department"
  // get employee
  mysql.pool.query(sql_1,[eid], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test[0];
// get employee types
    mysql.pool.query(sql_2, function(err, rows, feilds){
      if(err){
        next(err);
        return;
      }
      test = JSON.stringify(rows);
      test = JSON.parse(test);
      context.employee_type = test;
      context.employee_type.forEach(el => {
        if(el.ID === context.results.etid){
          el.current = 1;
        } else {
          el.current = 0;
        }
      });
// get departments
      mysql.pool.query(sql_3, function(err, rows, feilds){
        if(err){
          next(err);
          return;
        }
        test = JSON.stringify(rows);
        test = JSON.parse(test);
        context.department = test;
        context.department.forEach(el => {
          if(el.ID === context.results.did){
            el.current = 1;
          } else {
            el.current = 0;
            
          }
        });
        // console.log(context);
        res.render('editEmployee', context)
      });
    });
  });
});

// DOES NOT WORK
app.post('/editEmployee', function(req, res){
  var First_Name = req.body.firstname;
  var Last_Name = req.body.lastname;
  var Salary = req.body.salary;
  var Employee_Type_ID = req.body.department;
  var Department_ID = req.body.employee_type;
  var eid = req.body.eid;

  var sql = "UPDATE `Employees` SET `First_Name` = (?),`Last_Name`=(?), `Salary`=(?), `Employee_Type_ID`=(?), `Department_ID`=(?) WHERE `Employees`.`ID` = (?)";
  mysql.pool.query(sql, [First_Name, Last_Name, Salary, Employee_Type_ID, Department_ID, eid], function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    
    console.log(req.body);
    res.redirect('/employees'); 
  });
});
*/






 
// get all departments
app.get('/departments', function(req, res){
  var context = {};
  sql = "SELECT * FROM Department";
  mysql.pool.query(sql, function(err, rows, feilds){
    if(err){
      next(err);
      return;
    }
    test = JSON.stringify(rows);
    test = JSON.parse(test);
    context.results = test;
    res.render('allDepartments', context);
  });

});
// create department
app.get('/createDepartment', function(req, res){
  res.render('createDepartment');
});
app.post('/createDepartment', function(req, res){
  var Department_Name = req.body.department;
  var Budget = req.body.budget;
  //insert into the database
  var sql = "INSERT INTO `Department` (`Department_Name`, `Budget`) VALUES (?,?)";
  mysql.pool.query(sql,[Department_Name,Budget], function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/departments');
  });
});

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
// create employee type
app.get('/createEmployeeType', function(req, res){
  res.render('createEmployeeType');
});
app.post('/createEmployeeType', function(req, res){
  var type = req.body.employee_type;
  //insert into the database
  var sql = "INSERT INTO `Employee_Type` (`Employee_Type`) VALUES (?)";
  mysql.pool.query(sql,[type], function(err, rows){
    if(err){
      next(err);
      return;
    }
    res.redirect('/employee_types');
  });
});

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
