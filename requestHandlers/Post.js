var FileHeader = _Config.post.FileHeader || "header.html";
var FileFooter = _Config.post.FileFooter || "footer.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request, response, write_cache) {

	var dataToSend = "";
	var query = _querystring.parse(_url.parse(request.url).query)["p"];

	if((query && query.match(/^[A-Za-z0-9]+$/)) && (data = _helper.getPost(query).contents) !== undefined) {
			response.setResponseCode(200);
			response.setContent(_helper.getPage(data));
	} else {
		response.setResponseCode(404);
		_responseCodeMessage.responseCodeMessage(response);
		write_cache = false;
	}

	if (write_cache) {var deps = [];
		_cache.add(request, response.getContent(), response.getContentType(), response.getResponseCode(), [ FileHeader, FileFooter, DirectoryPosts + "/" + query + ".json" ]);
		response.setLastModified(_cache.getLastModified(request));
	}
	response.send();
	return true;
}

exports.Post = Post;
