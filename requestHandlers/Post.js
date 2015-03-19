var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request, response, write_cache) {

	var dataToSend = "";
	var query = _querystring.parse(_url.parse(request.url).query)["p"];
	var data = '';

	if((query && query.match(/^[A-Za-z0-9]+$/)) && (data = _helper.getPost(query).contents) !== '') {
			response.setResponseCode(200);
			response.setContent(_helper.getPage(data));
	} else {
		response.setResponseCode(404);
		_responseCodeMessage.responseCodeMessage(response);
		write_cache = false;
	}

	if (write_cache) {
		_cache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
		response.setLastModified(_cache.getLastModified(request));
	}
	response.send();
	return true;
}

exports.Post = Post;
