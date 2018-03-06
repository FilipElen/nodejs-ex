/*var http = require('http');
var url  = require("url");

http.createServer(function (req, res) {
  var item = url.parse(req.url, true).query.item;
  res.writeHead(201, { 'Location': 'http://127.0.0.1:8080/' + item });
  res.end();
}).listen(8000, '127.0.0.1');*/
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Length': '0\%0d%0a%0d%0aHTTP/1.1 200 OK%0d%0aContent-Type: text/html%0d%0aContent-Length: 19%0d%0a%0d%0a<html>HACKED</html>' });
  res.end();
}).listen(8000, '127.0.0.1');
console.log('server running');
