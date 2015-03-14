function Edit(request, response, write_cache) {
	response.setResponseCode(200);
	response.setContent(_fs.readFileSync(_Config.FileEditor|| "editor.html", 'utf8'));
	if (write_cache) {
		_cache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
		response.setLastModified(_cache.getLastModified(request));
	}
	response.send();
	return true;
}

exports.Edit = Edit;
