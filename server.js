//Let us import things, my dude. -----------------------------------------------
var express = require('express');
var pug = require('pug');
var fs = require('fs');
var assert = require('assert');
var util = require('util');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

//Database: MySQL
var mysql = require('mysql');

// -----------------------------------------------------------------------------

//Let's start this thing, my dude
var app = express();
app.set('view engine', 'pug');

//Define port
var port = process.env.PORT || 8080;

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//Database setup ---------------------------------------------------------------
// Within the application environment (appEnv) there's a services object
var services = appEnv.services;

// The services object is a map named by service so we extract the one for MySQL
var mysql_services = services["compose-for-mysql"];

//This check ensures there is a services for MySQL databases
assert(!util.isUndefined(mysql_services), "Must be bound to compose-for-mysql services");

// We now take the first bound MySQL service and extract it's credentials object
var credentials = mysql_services[0].credentials;

var connectionString = credentials.uri;
// set up a new connection using our config details
var connection = mysql.createConnection(credentials.uri);
connection.connect(function(err) {
  if (err) {
    console.log(err);
  }
});

//------------------------------------------------------------------------------


//Functions --------------------------------------------------------------------

//Compiles the page in accordance to the input
function makePage(res, log) {
  console.log("The makePage function was invoked. ");
  //if (err) throw err;
  res.render('home.pug', {details: log});
  console.log("Rendering script finished. ");
}

//Creates the page in accordance to the file: log.haodaisawesomefileextension
function updatePageDetails(res) {
  console.log("The updatePageDetails function was invoked. ");
  var fileData;
  fs.readFile('log.haodaisawesomefileextension', function(err, data) {
    console.log("File is reading... ");
    if (err) throw err;
    fileData = data;
    console.log("File read! ");
    makePage(res, fileData);
  });
}

//Adds a section to the log file
function addDetail(detail, res) {
  console.log("addDetail function has been invoked. ");
  console.log("Detail added: " + detail);
  fs.appendFile('log.haodaisawesomefileextension', '\n' + detail, function(err, file) {
    if (err) throw err;
    console.log("Log file is updated.");
    updatePageDetails(res);
  });

}

//Resets log file, then outputs a blank page
function resetLog(res) {
  console.log("Invoker! QUAS! EXTORT! EXTORT! resetLog() has been INVOKED. ");
  fs.writeFile('log.haodaisawesomefileextension', '', function(err) {
    if (err) throw err;
    console.log("File has been reset. ");
  });
  makePage(res, ''); //Page output
}

//DATABASE functions -----------------------------------------------------------

//makeQueryToSimple makes a query to the 'simple' database
function makeQueryToSimple(query, res, callback) {
  console.log("The makeQueryToSimple() function has been EXTORT EXTORT EXTORT invoked. ");
  connection.query(query, function(err, data) {
    console.log("Connection established!")
    if (err) {
      res.status(500).send(err); //(not res)
      console.log(err);
    }
    else {
      console.log("No errors!")
      console.log(data);
      //res.send(data);
      callback(data)
    }
  });
}


//Creates and uses a database
function createDatabase(res, callback) {
  console.log("The createDatabase() function has been EXTORT EXTORT EXTORT invoked. ");
  makeQueryToSimple("CREATE DATABASE simple;", res, function(data) {
    console.log("Database created.")
    makeQueryToSimple("USE simple;", res, function(data) {
      console.log("Database in use. ");
      callback()
    });
  });
}

//Deletes the database
function deleteDatabase(res, callback) {
  console.log("deleteDatabase function has been invoked. ");
  makeQueryToSimple("DROP DATABASE simple;", res, function(data) {
    console.log("DataBASS DROP. ");
    callback()
  });
}

//creates a table
function createTable(res, callback) {
  console.log("The createTable() function has been invoked. ");
  makeQueryToSimple("CREATE TABLE person (id INTEGER AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), age INTEGER);", res, function(data) {
    console.log("Table created. ");
    callback(res)
  });
}

function deleteTable(res, callback) {
  console.log("The deleteTable() function has been invoked. ");
  makeQueryToSimple("DROP TABLE person;", res, function(data) {
    console.log("Table annihilated. ");
    callback(res)
  });
}
//
// //This will return true if the database exists, false if it does not.
function getDatabase(res, callback) {
  console.log("The getDatabase() function has been invoked");
  var boo;

  connection.query("SHOW DATABASES LIKE '%imple%';", function(err, data) {
    if (err) {
      res.status(500).send(err); //(not res)
      console.log(err);
    }
    else {
      console.log("connection queried!")
      console.log(data);
      if (data === undefined || data === null || data === '') {
        console.log("NO DATA.");
        boo = false;
        callback(boo);
      }
      else {
        console.log("DATABASE");
         boo = true;
         callback(boo);
        addDetail("Database here!");
      }
    }
  });
}

//This will return true if the table exists, false if it doesn't
function getTable(res, callback) {
  console.log("The getTable() function has been invoked");
  var boo;

  connection.query("SHOW DATABASES LIKE 'simple';", function(err, data) {
    if (err) {
      res.status(500).send(err); //(not res)
      console.log(err);
    }
    else {
      console.log(data);
      if (data === undefined || data === null || data === '') {
        boo = false;
        callback(boo);
      }
      else {
        boo = true;
        callback(boo);
      }
    }
  });
}

// -----------------------------------------------------------------------------

//Routing ----------------------------------------------------------------------

app.get('/createDatabase', function(req, res) {
  console.log("routed from /createDatabase");
  createDatabase(res, function(res) {
    addDetail("Database 'simple' has been created. ", res);
  });
  //updatePageDetails(res);
});

app.get('/destroyDatabase', function(req, res) {
  console.log("routed from /destroyDatabase");
  deleteDatabase(res, function(res) {
    addDetail("Database 'simple' has been deleted. ", res);
  });
  //updatePageDetails(res);
});

/*
MISSING: ADD/DELETE TABLE
*/

app.get('/log', function(req, res) {
  console.log("routed from /log");
  var existDatabase;
  var existTable;

  var status = "\n -- CURRENT DATABASE STATUS -- ";
  getDatabase(res, function(boo) {
    existDatabase = boo;
  });
  getTable(res, function(boo) {
    existTable = boo;
  });
  if (existDatabase) {
    console.log("DATABASE DETECTED");
    status = status.concat("\n<br>You are currently running a database.");
  }
  else if (!existDatabase) {
    console.log("NO DATABASE DETECTED");
    status = status.concat("\n<br>You are not currently running a database.");
  }

  if (existTable) {
    console.log("TABLE DETECTED");
    status = status.concat("\n<br>You are currently running a table.");
  }
  else if (!existTable) {
    console.log("NO TABLE DETECTED");
    status = status.concat("\n<br>You are not currently running a table.");
  }
  console.log("Status variable: " + status);
  addDetail(status, res); //Adds it to the log file
  //updatePageDetails(res);
});

app.get("/clearLog", function (req, res) {
  console.log("routed from /clearLog");
  fs.writeFile('log.haodaisawesomefileextension', "", function(err, file) {
    if (err) throw err;
    console.log("Log file is cleared.");
    updatePageDetails(res);
  });
});

app.get('/', function(req, res) {
  console.log("routed from '/'");
  makePage(res, "");
  //res.send("THIS WORKED.");
});

// -----------------------------------------------------------------------------

//Let's start the app!
app.listen(port);
console.log("Listening on: " + port);

require("cf-deployment-tracker-client").track();
