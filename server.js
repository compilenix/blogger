
function Start(handle, route) {

    function onRequest(request, response) {
        process_request(request, response, handle, route);
    }

    function onErr(e) {
        console.error(e);
    }

    var server = _http.createServer(onRequest);
    server.on('error', onErr);
    server.listen(_Config.server.port || 80);
}

function process_request(request, response, handle, route) {
    if (_fscache.has(request)) {
        _fscache.send(request, response);
    } else {
        route(handle, request, response);
    }
}


exports.Start = Start;
