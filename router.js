var url = require('url');

function Route(handle, request, response) {
	var pathname = url.parse(request.url).pathname;

    if (typeof handle[pathname] === 'function') {
        handle[pathname](request, response);
    } else {
        console.log("No request handler found for: " + pathname);
        response.writeHead(404, { "Content-Type": "text/html", "Server": "node.js/" + process.version });
        // default 404 copied from nginx
        response.end('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>');
    }
}


exports.Route = Route;
