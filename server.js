var Port = _Config.server.port || 80;
var HandleClientCacheControl = _Config.HandleClientCacheControl || true;
var DevMode = _Config.DevMode || false;

var _http = require('http');
var _domain = require('domain');

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
		_responseCodeMessage.responseCodeMessage(response);
		response.send();
		return false;
	}

	if (_cache.has(request) && request.headers["if-modified-since"] === _cache.getLastModified(request)) {
		response.setResponseCode(304);
		response.setLastModified(_cache.getLastModified(request));
		response.send();
	} else {

		var deliver_cache = !(HandleClientCacheControl && request.headers["cache-control"] === 'no-cache');
		var write_cache = handle[pathname].cache;

		if (deliver_cache && _cache.has(request)) {
			response.setLastModified(_cache.getLastModified(request));
			_cache.send(request, response);
			return false;
		}

		var data = route(handle[pathname].callback, request);

		if (data.code == 200) {
			if (write_cache) {
				_cache.add(request, response.content, response.mimetype, response.code);
				response.setLastModified(_cache.getLastModified(request));	
			}

			response.setContentType(data.mimetype);
			response.setResponseCode(200);

			if (data.type == 'content') {
				response.setContent(data.content);
			} else if (data.type == 'file') {
				var fileStream = _fs.createReadStream(data.content);
				response.sendFileStream(fileStream);
				return false;
			}


		} else {
			response.setResponseCode(data.code);
			_responseCodeMessage.responseCodeMessage(response);
		}

		response.send();
	}

	return false;
}


exports.Start = Start;
