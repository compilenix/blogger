
function Route(handle, request, response) {
	var pathname = _url.parse(request.url).pathname;

	if (typeof handle[pathname] === 'function') {
		return handle[pathname](request, response);
	} else {
		console.log("No request handler found for: " + pathname);
		response.setResponsCode(404);
		return response;
	}
}


exports.Route = Route;
