const fs = require("fs");

const Helper = require("../Helper.js");
const Renderer = require("../Renderer.js");

const config = require("../../Config.js");

class Edit {
	/**
	 * Creates an instance of Edit.
	 * @param {Server} server
	 * @memberOf Edit
	 */
	constructor(server) {
		this.server = server;
		this.response = {
			type: "error",
			code: 500,
			content: "",
			mimetype: "text/plain"
		};
	}

	/**
	 * @public
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Edit
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
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Edit
	 */
	_processRequest(request) {
		let renderer = new Renderer();
		renderer.fields.title += " - Editor";
		let content = renderer.render(fs.readFileSync("lib" + Helper.GetFsDelimiter() + config.FileEditor, "utf8"));

		return {
			type: "content",
			code: 200,
			content: content,
			mimetype: "text/html",
			push: () => {
				return [{
						path: config.staticContentUri + "Ubuntu-R.ttf",
						data: fs.readFileSync(config.staticContentPath + "Ubuntu-R.ttf", null),
						httpCode: 200,
						header: {
							"Content-Type": "application/x-font-truetype",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "Ubuntu-R.ttf").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "jquery.js",
						data: fs.readFileSync(config.staticContentPath + "jquery.js", null),
						httpCode: 200,
						header: {
							"Content-Type": "text/javascript",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "jquery.js").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "ace.js",
						data: fs.readFileSync(config.staticContentPath + "ace.js", null),
						httpCode: 200,
						header: {
							"Content-Type": "text/javascript",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "ace.js").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "worker-html.js",
						data: fs.readFileSync(config.staticContentPath + "worker-html.js", null),
						httpCode: 200,
						header: {
							"Content-Type": "text/javascript",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "worker-html.js").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "SourceCodePro-Regular.ttf.woff2",
						data: fs.readFileSync(config.staticContentPath + "SourceCodePro-Regular.ttf.woff2", null),
						httpCode: 200,
						header: {
							"Content-Type": "application/font-woff2",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "SourceCodePro-Regular.ttf.woff2").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "mode-html.js",
						data: fs.readFileSync(config.staticContentPath + "mode-html.js", null),
						httpCode: 200,
						header: {
							"Content-Type": "text/javascript",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "mode-html.js").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "theme-monokai.js",
						data: fs.readFileSync(config.staticContentPath + "theme-monokai.js", null),
						httpCode: 200,
						header: {
							"Content-Type": "text/javascript",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "theme-monokai.js").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "activel.png",
						data: fs.readFileSync(config.staticContentPath + "activel.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "activel.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "activer.png",
						data: fs.readFileSync(config.staticContentPath + "activer.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "activer.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "activec.png",
						data: fs.readFileSync(config.staticContentPath + "activec.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "activec.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "inactiveclose.png",
						data: fs.readFileSync(config.staticContentPath + "inactiveclose.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "inactiveclose.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "doc.png",
						data: fs.readFileSync(config.staticContentPath + "doc.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "doc.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "inactivel.png",
						data: fs.readFileSync(config.staticContentPath + "inactivel.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "inactivel.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "inactiver.png",
						data: fs.readFileSync(config.staticContentPath + "inactiver.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "inactiver.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "inactivec.png",
						data: fs.readFileSync(config.staticContentPath + "inactivec.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "inactivec.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					},
					{
						path: config.staticContentUri + "activeclose.png",
						data: fs.readFileSync(config.staticContentPath + "activeclose.png", null),
						httpCode: 200,
						header: {
							"Content-Type": "image/png",
							"Last-Modified": new Date(fs.statSync(config.staticContentPath + "activeclose.png").mtime).toUTCString(),
							"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
						}
					}
				];
			}
		};
	}
}

module.exports = Edit;
