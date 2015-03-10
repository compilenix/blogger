
function Route(handle, request, response) {
	var pathname = _url.parse(request.url).pathname;

    if (typeof handle[pathname] === 'function') {
        return handle[pathname](request, response);
    } else {
        console.log("No request handler found for: " + pathname);
        _writeHead["_404"](response);
        response.end();
    }
}


exports.Route = Route;
