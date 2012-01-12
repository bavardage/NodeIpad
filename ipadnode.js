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
	  if(args.x && args.y) {
	    var ps = process.spawn('xdotool', ['mousemove', args.x, args.y]);
	    res.simpleText(200, 'ok');
	  } else {
	    var ps = process.spawn('xdotool', ['getmouselocation']);

	    ps.stdout.on('data', function(data) {
	      // data like "x:23 y:83 screen:93"
	      var result = {};
	      var items = data.asciiSlice(0,data.length).split(' ');
	      for(var i = 0; i < 3; i++) {
		var kv = items[i].split(':');
		result[kv[0]] = parseInt(kv[1]);
	      }
	      res.simpleJSON(200, result);
	    });
	  }
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


function serveFile(file, contentType) {
  return function(req, res) {
    fs.readFile(file, function(error, content) {
      if(error) {
	res.writeHead(500);
	res.end();
      } else {
	res.writeHead(200, { 'Content-Type': contentType || 'text/html' });
	res.end(content, 'utf-8');
      }
    });
  };
}


get('/', serveFile('./index.html'));
get('/script.js', serveFile('./script.js', 'text/javascript'));


server.listen(8080, '10.0.0.1');