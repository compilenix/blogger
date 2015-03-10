﻿var Port = _Config.server.port || 80;
var HandleCacheControl = _Config.HandleCacheControl || true;

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
	var use_cache = true;
	if (HandleCacheControl && request.headers["cache-control"] === 'no-cache') {
		use_cache = false;
	}

	if (use_cache && _fscache.has(request)) {
		response = _fscache.send(request, response);
	} else {
		response = route(handle, request, response);
		_fscache.add(request, response.getContent());
	}
	response.send();
}


exports.Start = Start;
