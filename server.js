var http = require('http');

var Options = {
    Port: 80
}

function Start(handle, route) {

    function onRequest(request, response) {
        process_request(request, response, handle, route);
    }

    http.createServer(onRequest).listen(Options.Port);
    console.log("Server has started and listening on port: " + Options.Port);
}

function process_request(request, response, handle, route) {
    route(handle, request, response);
}


exports.Start = Start;
exports.Options = Options;
