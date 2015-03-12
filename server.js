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
	var use_cache = true;
	var pathname = _url.parse(request.url).pathname;
	var callback = handle[pathname].callback;

	var deliver_cache = !(HandleCacheControl && request.headers["cache-control"] === 'no-cache');
	var write_cache = handle[pathname].cache;

	if (deliver_cache && _fscache.has(request)) {
		response = _fscache.send(request, response);
		response.send();
		return null;
	}

	var response = route(callback, request, response);

	if (write_cache) {
		_fscache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
	}

	response.send();
}


exports.Start = Start;
