
function Favicon(request, response) {
    _writeHead["_200"](response, { "Content-Type": "image/x-icon", "Server": "node.js/" + process.version });

    _fs.readFile('favicon.ico', function (error, data) {
        response.end(data);
    });
}

exports.Favicon = Favicon;
