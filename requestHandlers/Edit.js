"use strict";

function Edit(request) {
	return {
		type: "content",
		code: 200,
		content: fs.readFileSync(Config.FileEditor || "editor.html", "utf8"),
		mimetype: "text/html"
	}
}

exports.Edit = Edit;
