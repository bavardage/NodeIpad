var http = require('http');
var url = require('url');
var process = require('child_process');
var fs = require('fs');



var NOT_FOUND = "Not Found\n";

function notFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain"
                     , "Content-Length": NOT_FOUND.length
                     });
  res.end(NOT_FOUND);
}

var server = http.createServer(function (req, res) {
  if (req.method === "GET" || req.method === "HEAD") {
    var handler = getMap[url.parse(req.url).pathname] || notFound;

    res.simpleText = function (code, body) {
      res.writeHead(code, { "Content-Type": "text/plain"
                          , "Content-Length": body.length
                          });
      res.end(body);
    };

    res.simpleJSON = function (code, obj) {
      var body = new Buffer(JSON.stringify(obj));
      res.writeHead(code, { "Content-Type": "text/json"
                          , "Content-Length": body.length
                          });
      res.end(body);
    };

    handler(req, res);
  }
});

var getMap = {};

var get = function (path, handler) {
  getMap[path] = handler;
};

var getArgs = function(path, callback) {
  var handler = function(req, res) {
    var query = url.parse(req.url, true).query || {};
    callback(req, res, query);
  };
  get(path, handler);
};


getArgs('/mouse', function(req, res, args) {
	  process.spawn('xdotool', ['mousemove', args.x, args.y]);
	  res.simpleText(200, 'OK');
	});
getArgs('/click', function(req, res, args) {
	  process.spawn('xdotool', ['click', args.button || 1]);
	  res.simpleText(200, 'OK');
	});
getArgs('/command', function(req, res, args) {
	  var cmd = args.command;
	  if(cmd) {
	    var arguments = [];
	    if(args.args) {
	      console.log('has arguments: "' + args.args + '"');
	      arguments = args.args.split(' ');
	    }
	    process.spawn(cmd, arguments);
	    res.simpleText(200, cmd + ' ' + arguments.join(' ') + ' (PID ' + ')');
	  } else {
	    res.simpleText(500, 'no command');
	  }
	});

get('/', function(req, res) {
      fs.readFile('./index.html', function(error, content) {
        if (error) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        }
      });
    });


server.listen(8080, '10.0.0.1');