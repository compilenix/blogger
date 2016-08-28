var fs = require("fs");

function Edit(request) {
	var content = require("../renderer.js").render(fs.readFileSync("lib" + global.Helper.GetFsDelimiter() + global.Config.FileEditor, "utf8"));

	return {
		type: "content",
		code: 200,
		content: content,
		mimetype: "text/html",
		push: [
			{
				path: global.Config.staticContentUri + "Ubuntu-R.ttf",
				data: fs.readFileSync(global.Config.staticContentPath + "Ubuntu-R.ttf", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/x-font-truetype",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "Ubuntu-R.ttf").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "jquery.js",
				data: fs.readFileSync(global.Config.staticContentPath + "jquery.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "jquery.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "ace.js",
				data: fs.readFileSync(global.Config.staticContentPath + "ace.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "ace.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "worker-html.js",
				data: fs.readFileSync(global.Config.staticContentPath + "worker-html.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "worker-html.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "SourceCodePro-Regular.ttf.woff2",
				data: fs.readFileSync(global.Config.staticContentPath + "SourceCodePro-Regular.ttf.woff2", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/font-woff2",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "SourceCodePro-Regular.ttf.woff2").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "mode-html.js",
				data: fs.readFileSync(global.Config.staticContentPath + "mode-html.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "mode-html.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "theme-monokai.js",
				data: fs.readFileSync(global.Config.staticContentPath + "theme-monokai.js", null),
				httpCode: 200,
				header: {
					"Content-Type": "text/javascript",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "theme-monokai.js").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "activel.png",
				data: fs.readFileSync(global.Config.staticContentPath + "activel.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "activel.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "activer.png",
				data: fs.readFileSync(global.Config.staticContentPath + "activer.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "activer.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "activec.png",
				data: fs.readFileSync(global.Config.staticContentPath + "activec.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "activec.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "inactiveclose.png",
				data: fs.readFileSync(global.Config.staticContentPath + "inactiveclose.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "inactiveclose.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "doc.png",
				data: fs.readFileSync(global.Config.staticContentPath + "doc.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "doc.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "inactivel.png",
				data: fs.readFileSync(global.Config.staticContentPath + "inactivel.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "inactivel.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "inactiver.png",
				data: fs.readFileSync(global.Config.staticContentPath + "inactiver.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "inactiver.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "inactivec.png",
				data: fs.readFileSync(global.Config.staticContentPath + "inactivec.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "inactivec.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: global.Config.staticContentUri + "activeclose.png",
				data: fs.readFileSync(global.Config.staticContentPath + "activeclose.png", null),
				httpCode: 200,
				header: {
					"Content-Type": "image/png",
					"Last-Modified": new Date(fs.statSync(global.Config.staticContentPath + "activeclose.png").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (global.Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			}
		]
	};
}

exports.Edit = Edit;
