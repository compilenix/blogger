var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request, response, write_cache) {

	var htmlCode = 404;
	var dataToSend = "";
	var query = _querystring.parse(_url.parse(request.url).query)["p"];
	var data = '';

	if(query && query.match(/^[A-Za-z0-9]+$/)) {
		if ((data = _helper.getPost(query)) !== '') {
			htmlCode = 200;
			dataToSend = _helper.getPage(data);
		} else {
			htmlCode = 404;
			dataToSend = '<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>';
		}
	} else {
		htmlCode = 404;
		dataToSend = '<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>';
	}

	response.setResponseCode(htmlCode);
	response.setContent(dataToSend);
	if (write_cache) {
		_fscache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
		response.setLastModified(_fscache.getLastModified(request));
	}
	response.send();
	return true;
}

exports.Post = Post;
