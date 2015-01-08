var fs = require('fs');

function Favicon(request, response) {
    _writeHead["_200"](response, { "Content-Type": "image/x-icon", "Server": "node.js/" + process.version });

    fs.readFile('favicon.ico', function (error, data) {
        if (error) {
            //console.log(error);
        }
        response.end(data);
    });
}

exports.Favicon = Favicon;
