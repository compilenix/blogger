var Port = _Config.server.port || 80;
var HandleClientCacheControl = _Config.HandleClientCacheControl || true;
var DevMode = _Config.DevMode || false;

function Start(handle, route) {
	var handle = handle;

	if (!DevMode) {
		var domain = _domain.create();
		var onErrRes = undefined;

		domain.on('error', onErr);
	}

	function onRequest(request, response) {
		var res = new responseWrapper(response);
		if (!DevMode) {
			onErrRes = res;
		}
		process_request(request, res, handle, route);
	}

	function onErr(e) {
		console.error('error', e.stack);
		onErrRes.setResponseCode(500);
		onErrRes.setContent('');
		_responseCodeMessage.responseCodeMessage(onErrRes);
		onErrRes.send();
		process.exit(1);
	}

	if (!DevMode) {
		domain.run(function() {
			_http.createServer(onRequest).listen(Port);
		});
	} else {
		_http.createServer(onRequest).listen(Port);
	}

	
}

function process_request(request, response, handle, route) {
	var pathname = _url.parse(request.url).pathname;

	if (!handle[pathname]) {
		response.setResponseCode(404);
		response.send();
		return false;
	}

	if (!(_cache.validate(request))) {
		_cache.del(request);
	}

	if (_cache && _cache.has(request) && request.headers["if-modified-since"] === _cache.getLastModified(request)) {
		response.setResponseCode(304);
		response.setLastModified(_cache.getLastModified(request));
		response.send();
	} else {

		var deliver_cache = !(HandleClientCacheControl && request.headers["cache-control"] === 'no-cache');
		var write_cache = _cache && handle[pathname].cache && deliver_cache;

		if (_cache && deliver_cache && _cache.has(request)) {
			response.setLastModified(_cache.getLastModified(request));
			_cache.send(request, response);
			return false;
		}

		route(handle[pathname].callback, request, response, write_cache);
	}

	return false;
}


exports.Start = Start;
