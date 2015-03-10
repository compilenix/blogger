
function Regular(request, response) {
	return true;
    // _writeHead["_200"](response, { "Content-Type": "application/octet-stream", "Server": "node.js/" + process.version });

    // _fs.readFile(_Config.fonts.Regular_path, function (error, data) {
    //     response.end(data);
    // });
}

function Bold(request, response) {
	return true;
    // _writeHead["_200"](response, { "Content-Type": "application/octet-stream", "Server": "node.js/" + process.version });

    // _fs.readFile(_Config.fonts.Bold_path, function (error, data) {
    //     response.end(data);
    // });
}

exports.Regular = Regular;
exports.Bold = Bold;
