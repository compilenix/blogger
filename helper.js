var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function getPosts(noreverse) {
	var data = [];
	if (noreverse) {
		var posts = _fs.readdirSync(DirectoryPosts);
	} else {
		var posts = _fs.readdirSync(DirectoryPosts).reverse();
	}

	for (var i = 0; i < posts.length; i++) {
		if (_fs.existsSync(DirectoryPosts + '/' + posts[i] + ".asc")) {
			data.push(posts[i].replace(".html", ''));
		}
	}

	return data;
}

function writePost(id, content, title) {
	var data = JSON.stringify({
		title : title,
		contents: content
	});
	_fs.writeFileSync(DirectoryPosts + '/' + id + ".html", data, 'utf8');
	_fs.writeFileSync(DirectoryPosts + '/' + id + ".html.asc", '', 'utf8');
}

function getPost(id) {
	if (_fs.existsSync(DirectoryPosts + '/' + id + ".html.asc")) {
		return JSON.parse(_fs.readFileSync(DirectoryPosts + '/' + id + '.html', 'utf8'));
	} else {
		return '';
	}
}

function getPage(content) {
	var header = _fs.readFileSync((_Config.post.FileHeader || "header.html"), 'utf8');
	var footer = _fs.readFileSync((_Config.post.FileFooter || "footer.html"), 'utf8');
	return header + content + footer;
}


exports.getPost = getPost;
exports.getPosts = getPosts;
exports.getPage = getPage;
exports.writePost = writePost;
