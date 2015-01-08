
var version = "0.80";
var Regular_path = 'cdn/fonts/ubuntu-font-family-' + version + '/Ubuntu-R.ttf';
var Bold_path = 'cdn/fonts/ubuntu-font-family-' + version + '/Ubuntu-B.ttf';

function Regular(request, response) {
    _writeHead["_200"](response, { "Content-Type": "application/octet-stream", "Server": "node.js/" + process.version });

    _fs.readFile(Regular_path, function (error, data) {
        if (error) {
            //console.log(error);
        }
        response.end(data);
    });
}

function Bold(request, response) {
    _writeHead["_200"](response, { "Content-Type": "application/octet-stream", "Server": "node.js/" + process.version });

    _fs.readFile(Bold_path, function (error, data) {
        if (error) {
            //console.log(error);
        }
        response.end(data);
    });
}

exports.Regular = Regular;
exports.Regular_path = Regular_path;

exports.Bold = Bold;
exports.Bold_path = Bold_path;
