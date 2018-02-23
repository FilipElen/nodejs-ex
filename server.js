//  OpenShift sample Node application
var express = require('express'),
app     = express(),
morgan  = require('morgan'),
mysql    = require('mysql');



var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

/*var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port     : '13306',
  user     : 'root',
  password : 'root',
  database : 'books'
});*/
var connection = mysql.createConnection({
  host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
  user     : process.env.OPENSHIFT_MYSQL_USER,
  password : process.env.OPENSHIFT_MYSQL_PASSWORD,
  port     : process.env.OPENSHIFT_MYSQL_DB_PORT,
  database : 'books'
});
console.log(process.env);
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))


app.get('/', function (req, res) {
  var queryResult;
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }

    console.log('connected as id ' + connection.threadId);
  });
  connection.query('SELECT * FROM books.tblBook', function (error, results, fields) {
    if (error) throw error;
    queryResult = results;
    connection.end();
    res.render('index.html', {books : queryResult});
  });

});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
//app.listen(8080, '127.0.0.1');
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
