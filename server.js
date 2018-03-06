//  OpenShift sample Node application
var express = require('express'),
app     = express(),
morgan  = require('morgan'),
mysql    = require('mysql'),
bodyParser = require('body-parser');


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var pool = mysql.createPool({
  multipleStatements: true,
  connectionLimit : 3,
  host     : '127.0.0.1',
  port     : '13306',
  user     : 'root',
  password : 'root',
  database : 'books'
});
/*
var pool = mysql.createPool({
multipleStatements: true,
connectionLimit : 3,
host     : process.env.MYSQL_SERVICE_HOST,
user     : 'userJJI',
password : 'root',
port     : process.env.MYSQL_SERVICE_PORT,
database : 'books'
});*/
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.redirect('/index.html');
});
app.get('/index.html', function (req, res) {

  var queryResult;
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
    connection.query('SELECT * FROM books.tblBook', function (error, results, fields) {
      if (error) throw error;
      queryResult = results;
      console.log('RESULT: ' + results);
      connection.release();
      res.render('index.html', {books : queryResult});
    });
  });
});
app.get('/add.html', function (req, res) {
  res.render('add.html');
});
app.post('/add.html', function (req, res) {
  var book = req.body;
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
    var query = "INSERT INTO books.tblBook (tblBook.naam, tblBook.auteur, tblBook.beschrijving)"+
    " VALUES ('" + book.naam + "','" +  book.auteur + "','" +  book.beschrijving + "');"
    console.log('post query: ' + query);
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      console.log('success :' + results);
      connection.release();
    });
  });
  res.redirect('/');
});
app.get('/search.html', function (req, res) {
  res.render('search.html');
});
app.post('/search.html', function (req, res) {
  var queryResult;
  var request = req.body;
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
    connection.query("SELECT * FROM books.tblBook where tblBook.auteur LIKE '%" + request.auteur + "%' ", function (error, results, fields) {
      if (error) throw error;
      queryResult = results;
      console.log('RESULT: ' + results.toString());
      connection.release();
      if (queryResult.length == 0) {
        queryResult.push({'naam': 'n/a', 'auteur': 'auteur werd niet gevonden', 'beschrijving' : 'n/a'})
      }
      res.header({ 'Location': 'http://127.0.0.1:8080/' + request.auteur });
      console.log('response header from search: ' + JSON.stringify(res.header()._headers));
      res.render('search_result.html', {books : queryResult});
    });
  });
});
app.get('/test', function (req, res) {
  //res.writeHead(200, { 'Content-Length': '00%0d%00%0d%0HTTP/1.1 200 OK0%0d%0Content-Type: text/html0%0d%0Content-Length: 190%0d%00%0d%0<html>HACKED</html>' });
  //res.writeHead(200,{'Content-Length' : '0', 'Content-Type' : 'text/html'});
  console.log('response header: ' + JSON.stringify(res.header()._headers));
  res.end();
  /*const body = 'hello world';
  res.writeHead(200, {
  'Content-Length': Buffer.byteLength(body),
  'Content-Type': 'text/plain'
});
res.end(body);*/
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
app.listen(8080, '127.0.0.1');
console.log('server running');
//console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
