//Let us import things, my dude. -----------------------------------------------
var express = require('express');
var pug = require('pug');
var fs = require('fs');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

//Database: MySQL
var mysql = require('mysql');

// -----------------------------------------------------------------------------

//Let's start this thing, my dude
var app = express();
app.set('view engine', 'pug');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//Functions --------------------------------------------------------------------

//Compiles the page in accordance to the input
function makePage(res, log) {
  console.log("The makePage function was invoked. ");
  //if (err) throw err;
  res.render('home', {details: log});
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
  fs.writeFile('log.haodaisawesomefileextension', '', functioN(err) {
    if (err) throw err;
    console.log("File has been reset. ");
  });
  makePage(res, ''); //Page output
}

//DATABASE STUFF

// -----------------------------------------------------------------------------

//Routing ----------------------------------------------------------------------
app.get('/', function(req, res) {
  makePage(res, "");
})
// -----------------------------------------------------------------------------

//Let's start the app!
app.listen(port);
