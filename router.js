function Route(callback, request, response, write_cache) {

	if (typeof callback === 'function') {
		return callback(request, response, write_cache);
	} else {
		console.log('Request handler found for: "' + _url.parse(request.url).pathname + '" but callback is not a function: "' + callback + '"!');
		response.setResponseCode(500);
		response.send();
	}
}


exports.Route = Route;
