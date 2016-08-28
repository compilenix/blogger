var querystring = require("querystring");
var url = require("url");
var fs = require("fs");

function Static(request) {
	const response = {
		type: "error",
		code: 404,
		content: "file not found!",
		mimetype: "text/plain"
	};
	const path = global.Helper.replaceAll("/", global.Helper.GetFsDelimiter(), global.Config.staticContentPath);

	if (url.parse(request.url).pathname === "/favicon.ico") {
		response.code = 200;
		response.type = "file";
		response.content = path + global.Helper.GetFsDelimiter() + "favicon.ico";
		response.mimetype = "image/x-icon";
		return response;
	}

	const file = querystring.parse(url.parse(request.url).query)["f"];

	if (file) {
		const fileList = fs.readdirSync(path);
		if (fileList.indexOf(file) != -1) {
			response.type = "file";
			response.content = path + global.Helper.GetFsDelimiter() + file; // TODO fix this
			response.code = 200;
			const extension = file.split(".").reverse()[0] || "";
			switch (extension) {
				case "js":
					response.mimetype = "text/javascript";
					break;
				case "css":
					response.mimetype = "text/css";
					break;
				case "png":
					response.mimetype = "image/png";
					break;
				case "jpg":
					response.mimetype = "image/jpeg";
					break;
				case "jpeg":
					response.mimetype = "image/jpeg";
					break;
				case "ttf":
					response.mimetype = "application/x-font-truetype";
					break;
				case "woff":
					response.mimetype = "application/font-woff";
					break;
				case "woff2":
					response.mimetype = "application/font-woff2";
					break;
				case "svg":
					response.mimetype = "image/svg+xml";
					break;
				case "otf":
					response.mimetype = "application/x-font-opentype";
					break;
				case "ico":
					response.mimetype = "image/x-icon";
					break;
				default:
					response.mimetype = "application/octet-stream";
					break;
			}
		}
	}

	return response;
}

exports.Static = Static;
