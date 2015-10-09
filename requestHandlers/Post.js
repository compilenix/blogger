var FileHeader = _Config.post.FileHeader || "header.html";
var FileFooter = _Config.post.FileFooter || "footer.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request) {

	var response = {
		type: 'error',
		code: 404,
		content: 'post not found!',
		mimetype: 'text/plain'
	}

	var query = _querystring.parse(_url.parse(request.url).query)["p"];
	var data;
	if((query && query.match(/^[A-Za-z0-9]+$/)) && (data = _helper.getPost(query).contents) !== undefined) {
			response.type = 'content';
			response.code = 200;
			response.content = _helper.getPage(data);
			response.mimetype = 'text/html';
	}

	return response;
}

exports.Post = Post;
