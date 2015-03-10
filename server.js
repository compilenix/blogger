var Port = _Config.server.port || 80;

function Start(handle, route) {

	function onRequest(request, response) {
		var response = new responseWrapper(response);
		process_request(request, response, handle, route);
	}

	function onErr(e) {
		console.error(e);
	}

	var server = _http.createServer(onRequest);
	server.on('error', onErr);
	server.listen(Port);
}

function process_request(request, response, handle, route) {
	if (_fscache.has(request)) {
		response = _fscache.send(request, response);
		response.send();
	} else {
		response = route(handle, request, response);
		_fscache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
		response.send();
	}
}


exports.Start = Start;
