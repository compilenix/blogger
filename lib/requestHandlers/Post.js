function Post(request) {
	const response = {
		type: "error",
		code: 404,
		content: "post not found!",
		mimetype: "text/plain"
	};

	const query = request.url.split("/").pop();
	var data;
	if ((query && query.match(/^[A-Za-z0-9]+$/)) && (data = global.Helper.getPost(query)) !== "") {
		if (data.title) {
			response.content = global.Helper.getPage(data.contents, data.title);
		} else {
			response.content = global.Helper.getPage(data.contents);
		}

		response.type = "content";
		response.code = 200;
		response.mimetype = "text/html";
	}

	return response;
}

exports.Post = Post;
