var Port = _Config.server.port || 80;
var HandleCacheControl = _Config.HandleCacheControl || true;

function Start(handle, route) {

	function onRequest(request, response) {
		console.log(request)
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
	var mtime = _fscache.getLastModified(request);
	var eTag = _fscache.getETag(request);

	if ((request.headers["if-modified-since"] === mtime) && (request.headers["if-none-match"] === eTag)) {
		response.setETag(eTag);
		response.setResponseCode(304);
		response.setLastModified(mtime);
		response.send();
	} else {
		var use_cache = true;
		var pathname = _url.parse(request.url).pathname;
		var callback = handle[pathname].callback;

		var deliver_cache = !(HandleCacheControl && request.headers["cache-control"] === 'no-cache');
		var write_cache = handle[pathname].cache;

		if (deliver_cache && _fscache.has(request)) {
			_fscache.send(request, response);
		}

		route(callback, request, response, write_cache);
	}

	return false;
}


exports.Start = Start;
