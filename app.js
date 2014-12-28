var server = require('./server.js');
var router = require('./router.js');
var requestHandlers = require("./requestHandlers.js");

server.Options.Port = 8000;

var root = "/blog/";
var handle = {}
handle[root] = requestHandlers.Index;
handle[root + "post/"] = requestHandlers.Post;
handle["/favicon.ico"] = requestHandlers.Favicon;

server.Start(handle, router.Route);
