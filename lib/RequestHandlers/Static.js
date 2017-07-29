const querystring = require("querystring");
const url = require("url");
const fs = require("fs");

const Helper = require("../Helper.js");
const Server = require("../Server.js");
const config = require("../../Config.js");

class Static {
    /**
	 * Creates an instance of Static.
	 * @param {Server} server
	 * @memberOf Static
	 */
	constructor(server) {
		this.server = server;
		this.response = {
			type: "error",
			code: 404,
			content: "nothing found!",
			mimetype: "text/plain"
		};
	}

	/**
	 * @public
	 * @param {http.IncomingMessage} request
	 * @returns {any}
	 * @memberOf Static
	 */
	processRequest(request) {
		switch (request.method) {
			case "GET":
				return this._processRequest(request);
			default:
				this.response.code = 501;
				break;
		}

		return this.response;
	}

    /**
     * @private
     * @param {http.IncomingMessage} request
     */
	_processRequest(request) {
		const path = Helper.replaceAll("/", Helper.GetFsDelimiter(), config.staticContentPath);
		this.response = {
			type: "error",
			code: 404,
			content: "",
			mimetype: ""
        };

        if (!request.url) return this.response;

		if (url.parse(request.url).pathname === "/favicon.ico") {
			this.response.code = 200;
			this.response.type = "file";
			this.response.content = path + Helper.GetFsDelimiter() + "favicon.ico";
			this.response.mimetype = "image/x-icon";
			return this.response;
		}

		if (url.parse(request.url).pathname === "/worker-html.js") {
			this.response.code = 200;
			this.response.type = "file";
			this.response.content = path + "worker-html.js";
			this.response.mimetype = "text/javascript";
			return this.response;
		}

		const file = querystring.parse(url.parse(request.url).query).f;
		if (!file) {
			return this.response;
		}

		if (fs.readdirSync(path).indexOf(file) === -1) {
			return this.response;
		}

		this.response.type = "file";
		this.response.content = `${path}${Helper.GetFsDelimiter()}${file}`;
		this.response.code = 200;

		const extension = file.split(".").reverse()[0] || "";
		switch (extension) {
			case "js":
				this.response.mimetype = "text/javascript";
				break;
			case "css":
				this.response.mimetype = "text/css";
				break;
			case "png":
				this.response.mimetype = "image/png";
				break;
			case "jpg":
				this.response.mimetype = "image/jpeg";
				break;
			case "jpeg":
				this.response.mimetype = "image/jpeg";
				break;
			case "ttf":
				this.response.mimetype = "application/x-font-truetype";
				break;
			case "woff":
				this.response.mimetype = "application/font-woff";
				break;
			case "woff2":
				this.response.mimetype = "application/font-woff2";
				break;
			case "svg":
				this.response.mimetype = "image/svg+xml";
				break;
			case "otf":
				this.response.mimetype = "application/x-font-opentype";
				break;
			case "ico":
				this.response.mimetype = "image/x-icon";
				break;
			default:
				this.response.mimetype = "application/octet-stream";
				break;
		}

		return this.response;
	}
}

module.exports = Static;
