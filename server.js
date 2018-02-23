//  OpenShift sample Node application
var express = require('express'),
app     = express(),
morgan  = require('morgan'),
mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'mysql.security-xss-assignment2.svc',
  database : 'books'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))


app.get('/', function (req, res) {
  res.render('index.html');
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
