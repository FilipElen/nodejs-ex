var express = require('express'),
app     = express(),
morgan  = require('morgan'),
mysql    = require('mysql'),
bodyParser = require('body-parser'),
passport = require('passport'),
Strategy = require('passport-local').Strategy,
connect_ensure_login = require('connect-ensure-login'),
db = require('./db');


// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    db.users.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });

  // mysql connection
  var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

  /*var pool = mysql.createPool({
    multipleStatements: true,
    connectionLimit : 3,
    host     : '127.0.0.1',
    port     : '13306',
    user     : 'root',
    password : 'root',
    database : 'books'
  });*/
  
  var pool = mysql.createPool({
  multipleStatements: true,
  connectionLimit : 3,
  host     : process.env.MYSQL_SERVICE_HOST,
  user     : 'userJJI',
  password : 'root',
  port     : process.env.MYSQL_SERVICE_PORT,
  database : 'books'
});
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
// authentication stuff
app.post('/login',
passport.authenticate('local', { failureRedirect: 'index.html'}),
function(req, res) {
  res.redirect('/');
});
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });



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
      res.render('index.html', {books : queryResult, user: req.user});
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
app.get('/search.html/',connect_ensure_login.ensureLoggedIn('index.html'), function (req, res) {
  if (!req.query.auteur) {
    res.render('search.html');
  }else {
    var queryResult;
    var auteur = req.query.auteur;
    pool.getConnection(function(err, connection) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
      console.log('connected as id ' + connection.threadId);
      connection.query("SELECT * FROM books.tblBook where tblBook.auteur LIKE '%" + auteur + "%' ", function (error, results, fields) {
        if (error) throw error;
        queryResult = results;
        console.log('RESULT: ' + results.toString());
        connection.release();
        if (queryResult.length == 0) {
          queryResult.push({'naam': 'n/a', 'auteur': 'auteur werd niet gevonden', 'beschrijving' : 'n/a'})
        }
        //res.header({ 'Location': 'http://127.0.0.1:8080/' + auteur });
        console.log('response header from search: ' + JSON.stringify(res.header()._headers));
        res.render('search_result.html', {books : queryResult});
      });
    });
  }
});
app.post('/search.html',connect_ensure_login.ensureLoggedIn('index.html'), function (req, res) {
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
//app.listen(8080, '127.0.0.1');
//console.log('server running');
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
