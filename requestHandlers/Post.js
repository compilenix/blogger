
var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request, response, write_cache) {
	return post(_fs.readFileSync(FileHeader, 'utf8'), request, response);
}

function post(header, request, response, write_cache) {

	var htmlCode = 404;
	var dataToSend = "";
	var query = _querystring.parse(_url.parse(request.url).query)["p"];
	var letters = new RegExp('^[A-Za-z0-9]+$');
	var data = '';

	if(query !== undefined && query !== null && query.match(letters)) {
		if ((data = _helper.getPost(query)) !== '') {
			htmlCode = 200;
			dataToSend += header;
			dataToSend += data;
		} else {
			htmlCode = 404;
			dataToSend = '<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>';
		}
	} else {
		htmlCode = 404;
		dataToSend = '<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>';
	}

	dataToSend += "</body>\n";
	response.setResponseCode(htmlCode);
	response.setContent(dataToSend);
	if (write_cache) {
		_fscache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
	}
	response.send();
	return true;
}


exports.Post = Post;
