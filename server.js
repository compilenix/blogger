var http = require('http');
var url = require('url');

var Options = {
    Port: 80
}

function Start(handle, route) {

    function onRequest(request, response) {
        process_request(request, response, handle, route);
    }

    http.createServer(onRequest).listen(Options.Port);
    console.log("Server has started and listening on port " + Options.Port);
}

function process_request(request, response, handle, route) {
    route(handle, url.parse(request.url).pathname, response);
}


exports.Start = Start;
exports.Options = Options;
