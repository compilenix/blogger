﻿var url = require('url');

function Route(handle, request, response) {
	var pathname = url.parse(request.url).pathname;

    if (typeof handle[pathname] === 'function') {
        handle[pathname](request, response);
    } else {
        console.log("No request handler found for: " + pathname);
        _writeHead["_404"](response);
        response.end();
    }
}


exports.Route = Route;
