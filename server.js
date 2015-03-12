var Port = _Config.server.port || 80;
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

	var pathname = _url.parse(request.url).pathname;

	if (!handle[pathname]) {
		response.setResponseCode(404);
		response.send();
		return false;
	}

	if (_fscache.has(request) && request.headers["if-modified-since"] === _fscache.getLastModified(request)) {
		response.setResponseCode(304);
		response.setLastModified(_fscache.getLastModified(request));
		response.send();
	} else {
		var callback = handle[pathname].callback;

		var deliver_cache = !(HandleCacheControl && request.headers["cache-control"] === 'no-cache');
		var write_cache = handle[pathname].cache;

		if (deliver_cache && _fscache.has(request)) {
			response.setLastModified(_fscache.getLastModified(request));
			_fscache.send(request, response);
			return false;
		}

		route(callback, request, response, write_cache);
	}

	return false;
}


exports.Start = Start;
