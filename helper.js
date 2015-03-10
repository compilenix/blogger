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

function getPost(id) {
	if (_fs.existsSync(DirectoryPosts + '/' + id + ".html.asc")) {
		return _fs.readFileSync(DirectoryPosts + '/' + id + '.html', 'utf8');
	} else {
		return '';
	}
}


exports.getPost = getPost;
exports.getPosts = getPosts;
