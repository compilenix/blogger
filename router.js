function Route(callback, request, response, write_cache) {

	if (typeof callback === 'function') {
		return callback(request, response, write_cache);
	} else {
		console.log("No request handler found for: " + pathname);
		response.setResponseCode(404);
		return response;
	}
}


exports.Route = Route;
