var Port = _Config.server.port || 80;
var HandleCacheControl = _Config.HandleCacheControl || true;

function Start(handle, route) {

	var handle = handle;

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

	if (_cache && _cache.has(request) && request.headers["if-modified-since"] === _cache.getLastModified(request)) {
		response.setResponseCode(304);
		response.setLastModified(_cache.getLastModified(request));
		response.send();
	} else {
		var callback = handle[pathname].callback;

		var deliver_cache = !(HandleCacheControl && request.headers["cache-control"] === 'no-cache');
		var write_cache = _cache && handle[pathname].cache && deliver_cache;

		if (_cache && deliver_cache && _cache.has(request)) {
			response.setLastModified(_cache.getLastModified(request));
			_cache.send(request, response);
			return false;
		}

		route(callback, request, response, write_cache);
	}

	return false;
}


exports.Start = Start;
