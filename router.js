function Route(callback, request, response) {

	if (typeof callback === 'function') {
		return callback(request, response);
	} else {
		console.log("No request handler found for: " + pathname);
		response.setResponseCode(404);
		return response;
	}
}


exports.Route = Route;
