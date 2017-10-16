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
  });

  makePage(res, fileData);
}

//Adds a section to the log file
function addDetail(detail) {
  console.log("addDetail function has been invoked. ");
  fs.appendFile('log.haodaisawesomefileextension', '\n' + detail, function(err, file) {
    if (err) throw err;
    console.log("Log file is updated.")
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
function makeQueryToSimple(query, res) {
  console.log("The makeQueryToSimple() function has been EXTORT EXTORT EXTORT invoked. ");
  connection.query(query, function(err, res) {
    if (err) {
      res.status(500).send(err); //(not res)
      console.log(err);
    }
    else {
      console.log(res);
      res.send(res);
    }
  });
}


//Creates and uses a database
function createDatabase(res) {
  console.log("The createDatabase() function has been EXTORT EXTORT EXTORT invoked. ");
  makeQueryToSimple("CREATE DATABASE simple;", res);
  makeQueryToSimple("USE DATABASE simple;", res);
  console.log("Database created. ");
}

//Deletes the database
function deleteDatabase(res) {
  console.log("deleteDatabase function has been invoked. ");
  makeQueryToSimple("DROP DATABASE simple;");
  console.log("DataBASS DROP. ");
}

//creates a table
function createTable(res) {
  console.log("The createTable() function has been invoked. ");
  makeQueryToSimple("CREATE TABLE person (id INTEGER AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), age INTEGER);", res);
  console.log("Table created. ");
}

function deleteTable(res) {
  console.log("The deleteTable() function has been invoked. ");
  makeQueryToSimple("DROP TABLE person;", res);
  console.log("Table annihilated. ");
}
//
// //This will return true if the database exists, false if it does not.
function getDatabase(res) {
  console.log("The getDatabase() function has been invoked");
  connection.query("SHOW DATABASES LIKE 'simple';", function(err, data) {
    if (err) {
      res.status(500).send(err); //(not res)
      console.log(err);
    }
    else {
      console.log(data);
      if (data === undefined || data === NULL || data === '') {
        return false;
      }
      else {
        return true;
      }
    }
  });
}

//This will return true if the table exists, false if it doesn't
function getTable(res) {
  console.log("The getTable() function has been invoked");
  connection.query("SHOW DATABASES LIKE 'simple';", function(err, data) {
    if (err) {
      res.status(500).send(err); //(not res)
      console.log(err);
    }
    else {
      console.log(data);
      if (data === undefined || data === NULL || data === '') {
        return false;
      }
      else {
        return true;
      }
    }
  });
}

// -----------------------------------------------------------------------------

//Routing ----------------------------------------------------------------------
app.get('/', function(req, res) {
  console.log("routed from '/'");
  makePage(res, "");
  //res.send("THIS WORKED.");
});

app.get('/createDatabase', function(req, res) {
  console.log("routed from /createDatabase");
  createDatabase(res);
  addDetail("Database 'simple' has been created. ");
  updatePageDetails(res);
});

app.get('/deleteDatabase', function(req, res) {
  console.log("routed from /deleteDatabase");
  createDatabase(res);
  addDetail("Database 'simple' has been deleted. ");
  updatePageDetails(res);
});

/*
MISSING: ADD/DELETE TABLE
*/

app.get('/log', function(req, res) {
  console.log("routed from /log");
  var status = "";
  if (getDatabase) {
    status.append("You are currently running a database. \n");
  }
  else if (!getDatabase) {
    status.append("You are not currently running a database. \n");
  }

  if (getTable) {
    status.append("You are currently running a table. \n");
  }
  else if (!getTable) {
    status.append("You are not currently running a table. \n");
  }
  addDetail(status); //Adds it to the log file
  updatePageDetails(res);
});

app.get("/clearLog", function (req, res) {
  console.log("routed from /clearLog");
  fs.writeFile('log.haodaisawesomefileextension', "", function(err, file) {
    if (err) throw err;
    console.log("Log file is cleared.");
  });
  updatePageDetails(res);
});
// -----------------------------------------------------------------------------

//Let's start the app!
app.listen(port);
console.log("Listening on: " + port);

require("cf-deployment-tracker-client").track();
