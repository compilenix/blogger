
var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";
var CountPosts = _Config.post.CountPosts || 10;
var MessageOlderPage = _Config.post.MessageOlderPage || "Older";
var MessageNewerPage = _Config.post.MessageNewerPage || "Newer";
var MessageEnd = _Config.post.MessageEnd || "The end.";

function Page(request, response, write_cache) {
	return page(request, response, false, write_cache);
}

function Index(request, response, write_cache) {
	return page(request, response, true, write_cache);
}

function page(request, response, index, write_cache) {

	var posts = _helper.getPosts(true);
	var pageCount = Math.ceil(posts.length / CountPosts);

	if (!index) {
		var p = parseInt(_querystring.parse(_url.parse(request.url).query)["p"]);

		if (isNaN(p) || p < 1) {
			p = 1;
		}

		if (p > pageCount) {
			   p = pageCount;
		}
	} else {
		p = pageCount;
	}


	var content = '<ul>\n';

	var lastPost = p * CountPosts;
	var firstPost = lastPost - CountPosts;

	for (var i = lastPost; i > firstPost; i--) {
		if (posts[i - 1]) {
			content += '<li>';
			content += '[<a href="/post/?p=' + posts[i - 1] + '">post</a>] ';
			content += _helper.getPost(posts[i - 1]);
			content += '</li>\n';
		}
	}

	content += '</ul>\n\n';

	if (p == 1) {
		content += '<div style="text-align:center"><h2>' + MessageEnd + '</h2></div>';
	}

	content += '<div style="text-align:center">';

	if (p < pageCount) {
		content += '<a href="/page/?p=' + (p + 1)  + '">' + MessageNewerPage + '</a>';
	}

	if (p > 1) {
		content += '<a href="/page/?p=' + (p - 1)  + '">' + MessageOlderPage + '</a>';
	}

	content += "</div>\n";

	var dataToSend = _helper.getPage(content);

	response.setResponseCode(200);
	response.setContent(dataToSend);
	if (write_cache) {
		_cache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
		response.setLastModified(_cache.getLastModified(request));
	}
	response.send();
	return true;
}


exports.Page = Page;
exports.Index = Index;

