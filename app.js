var server = require('./server.js');
var router = require('./router.js');
var requestHandlers = require("./requestHandlers.js");

server.Options.Port = 8000;

var handle = {}
handle["/blog/"] = requestHandlers.Index;
handle["/favicon.ico"] = requestHandlers.Favicon;

server.Start(handle, router.Route);
