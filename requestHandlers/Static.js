var DirectoryStatic = _Config.post.DirectoryStatic || "static";

function Static(request, response, write_cache) {

	var file = _querystring.parse(_url.parse(request.url).query)["f"];

	if (!file) {
		response.setResponseCode(404);
	} else {
		var fileList = _fs.readdirSync(DirectoryStatic);

		if (fileList.indexOf(file) == -1) {
			response.setResponseCode(404);
		} else {
			response.setResponseCode(200);
			var extension = file.split('.').reverse()[0] || '';

			switch (extension) {
				case 'js':
					response.setContentType('text/javascript');
				break;
				case 'png':
					response.setContentType('image/png');
				break;
				case 'css':
					response.setContentType('text/css');
				break;
				default:
				break;
			}

			var fileStream = _fs.createReadStream(DirectoryStatic + '/' + file);
			response.sendFileStream(fileStream);

			return true;
		}
	}
	response.send();
	return true;
}

exports.Static = Static;
