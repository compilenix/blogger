function Edit(request) {
	return {
		type: 'content',
		code: 200,
		content: _fs.readFileSync(_Config.FileEditor|| "editor.html", 'utf8'),
		mimetype: 'text/html'
	}
}

exports.Edit = Edit;
