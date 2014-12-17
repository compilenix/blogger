
function Route(handle, pathname, response) {
    console.log("About to route request for: " + pathname);

    if (typeof handle[pathname] === 'function') {
        handle[pathname](response);
    } else {
        console.log("No request handler found for: " + pathname);
        response.writeHead(404, { "Conten-Type": "text/plain" });
        // default 404 copied from nginx
        response.write('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>');
        response.end();
    }
}


exports.Route = Route;
