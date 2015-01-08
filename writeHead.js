var defaults = { "Content-Type": "text/html", "Server": "node.js/" + process.version };

var _writeHead = {};
_writeHead["_200"] = _200;
_writeHead["_404"] = _404;

function _200(response, object) {
    if (object) {
        response.writeHead(200, defaults);
    } else {
        response.writeHead(200, object);
    }
}

function _404(response, object) {
    if (object) {
        response.writeHead(404, defaults);
    } else {
        response.writeHead(404, object);
    }
    response.write('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>');
}


exports._writeHead = _writeHead;
exports._200 = _200;
exports._404 = _404;
