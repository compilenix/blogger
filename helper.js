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
			data.push(posts[i].replace(".json", ''));
		}
	}

	return data;
}

function getTitle(id) {
	return getPost(id).title;
}

function getTitles(noreverse) {
	var data = []
	var list = getPosts(noreverse);

	for (var i = list.length - 1; i >= 0; i--) {
		data.push(getTitle(list[i]));
	};

	return data;
}

function writePost(id, content, title) {
	var data = JSON.stringify({
		title : title,
		contents: content
	});
	_fs.writeFileSync(DirectoryPosts + '/' + id + ".json", data, 'utf8');
	_fs.writeFileSync(DirectoryPosts + '/' + id + ".json.asc", '', 'utf8');
}

function getPost(id) {
	if (_fs.existsSync(DirectoryPosts + '/' + id + ".json.asc")) {
		return JSON.parse(_fs.readFileSync(DirectoryPosts + '/' + id + '.json', 'utf8'));
	} else {
		return '';
	}
}

function getPage(content) {
	var header = _fs.readFileSync((_Config.post.FileHeader || "header.html"), 'utf8');
	var footer = _fs.readFileSync((_Config.post.FileFooter || "footer.html"), 'utf8');
	return header + content + footer;
}

 function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};


exports.getPost = getPost;
exports.getPosts = getPosts;
exports.getPage = getPage;
exports.writePost = writePost;
exports.replaceAll = replaceAll;
exports.getTitle = getTitle;
exports.getTitles = getTitles;
