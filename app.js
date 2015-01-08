var server = require('./server.js');
var router = require('./router.js');
var requestHandlers = require("./requestHandlers.js");

server.Options.Port = 8000;

var root = "/blog/";
var handle = {};
handle[root] = requestHandlers.Index;
handle[root + "post/"] = requestHandlers.Post;

// static content
handle["/favicon.ico"] = requestHandlers.Favicon;
handle["/" + requestHandlers.Fonts["Regular_path"]] = requestHandlers.Fonts["Regular"];
handle["/" + requestHandlers.Fonts["Bold_path"]] = requestHandlers.Fonts["Bold"];

server.Start(handle, router.Route);
