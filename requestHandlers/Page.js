
var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";
var CountPosts = _Config.post.CountPosts || 10;
var MessageNextPage = _Config.post.MessageNextPage || "Next";
var MessageLastPage = _Config.post.MessageLastPage || "Prev";
var MessageEnd = _Config.post.MessageEnd || "The end.";

function Page(request, response, write_cache) {
	return page(_fs.readFileSync(FileHeader, 'utf8'), request, response, false, write_cache);
}

function Index(request, response, write_cache) {
	return page(_fs.readFileSync(FileHeader, 'utf8'), request, response, true, write_cache);
}

function page(header, request, response, index, write_cache) {

	var dataToSend = header;

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


	dataToSend += '<ul>\n';

	var lastPost = p * CountPosts;
	var firstPost = lastPost - CountPosts;

	for (var i = lastPost; i > firstPost; i--) {
		if (posts[i - 1]) {
			dataToSend += '<li>';
			dataToSend += '[<a href="/post/?p=' + posts[i - 1] + '">post</a>] ';
			dataToSend += _helper.getPost(posts[i - 1]);
			dataToSend += '</li>\n';
		}
	}

	dataToSend += '</ul>\n\n';

	if (p == 1) {
		dataToSend += '<div style="text-align:center"><h2>' + MessageEnd + '</h2></div>';
	}

	dataToSend += '<div style="text-align:center">';

	if (p < pageCount) {
		dataToSend += '<a href="/page/?p=' + (p + 1)  + '">Newer</a>';
	}

		if (p > 1) {
			dataToSend += '<a href="/page/?p=' + (p - 1)  + '">Older</a>';
		}

	dataToSend += "</div>\n</body>\n";
	response.setResponseCode(200);
	response.setContent(dataToSend);
	if (write_cache) {
		_fscache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
	}
	response.send();
	return true;
}


exports.Page = Page;
exports.Index = Index;

