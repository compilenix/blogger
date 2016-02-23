"use strict";

var FileHeader = Config.post.FileHeader || "header.html";
var FileFooter = Config.post.FileFooter || "footer.html";
var DirectoryPosts = Config.post.DirectoryPosts || "posts";

function Post(request) {

	var response = {
		type: "error",
		code: 404,
		content: "post not found!",
		mimetype: "text/plain"
	}

	var query = querystring.parse(url.parse(request.url).query)["p"];
	var data;
	if((query && query.match(/^[A-Za-z0-9]+$/)) && (data = Helper.getPost(query).contents) !== undefined) {
			response.type = "content";
			response.code = 200;
			response.content = Helper.getPage(data);
			response.mimetype = "text/html";
	}

	return response;
}

exports.Post = Post;
