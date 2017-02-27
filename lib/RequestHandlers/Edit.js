var fs = require("fs");

function Edit(request) {
	let renderer = require("../renderer.js");
	renderer.fields.title += " - Editor";
	let content = renderer.render(fs.readFileSync("lib" + Helper.GetFsDelimiter() + Config.FileEditor, "utf8"));

	// TODO change push[*].data to a function / callback to reduce execution time and memory usage
	return {
		type: "content",
		code: 200,
		content: content,
		mimetype: "text/html",
		push: [
			{
				path: Config.staticContentUri + "Ubuntu-R.ttf",
				data: fs.readFileSync(Config.staticContentPath + "Ubuntu-R.ttf", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/x-font-truetype",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "Ubuntu-R.ttf").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "jquery.js",
				data: fs.readFileSync(Config.staticContentPath + "jquery.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "jquery.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "ace.js",
				data: fs.readFileSync(Config.staticContentPath + "ace.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "ace.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "worker-html.js",
				data: fs.readFileSync(Config.staticContentPath + "worker-html.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "worker-html.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "SourceCodePro-Regular.ttf.woff2",
				data: fs.readFileSync(Config.staticContentPath + "SourceCodePro-Regular.ttf.woff2", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/font-woff2",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "SourceCodePro-Regular.ttf.woff2").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "mode-html.js",
				data: fs.readFileSync(Config.staticContentPath + "mode-html.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "mode-html.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "theme-monokai.js",
				data: fs.readFileSync(Config.staticContentPath + "theme-monokai.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "theme-monokai.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "activel.png",
				data: fs.readFileSync(Config.staticContentPath + "activel.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "activel.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "activer.png",
				data: fs.readFileSync(Config.staticContentPath + "activer.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "activer.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "activec.png",
				data: fs.readFileSync(Config.staticContentPath + "activec.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "activec.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "inactiveclose.png",
				data: fs.readFileSync(Config.staticContentPath + "inactiveclose.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "inactiveclose.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "doc.png",
				data: fs.readFileSync(Config.staticContentPath + "doc.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "doc.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "inactivel.png",
				data: fs.readFileSync(Config.staticContentPath + "inactivel.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "inactivel.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "inactiver.png",
				data: fs.readFileSync(Config.staticContentPath + "inactiver.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "inactiver.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "inactivec.png",
				data: fs.readFileSync(Config.staticContentPath + "inactivec.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "inactivec.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "activeclose.png",
				data: fs.readFileSync(Config.staticContentPath + "activeclose.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "activeclose.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			}
		]
	};
}

exports.Edit = Edit;
