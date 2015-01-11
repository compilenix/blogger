var defaults = { "Content-Type": "text/html", "Server": "node.js/" + process.version };

var _writeHead = {};
_writeHead["_200"] = _200;
_writeHead["_404"] = _404;

// OK
function _200(response, object) {
    if (object) {
        response.writeHead(200, object);
    } else {
        response.writeHead(200, defaults);
    }
}

// Not found
function _404(response, object) {
    if (object) {
        response.writeHead(404, object);
    } else {
        response.writeHead(404, defaults);
    }
    response.write('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>');
}


exports._200 = _200;
exports._404 = _404;
exports._writeHead = _writeHead;
