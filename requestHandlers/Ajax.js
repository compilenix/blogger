

function Ajax(request, response, write_cache) {

	if (request.method == 'POST') {
		var body = '';
       	request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var post = _querystring.parse(body);

            if (!checkApiKey(post.apikey)) {
            	response.setContent('{}');
				response.setContentType('application/json');
				response.setResponseCode(403);
				response.send();
				return false;
            }



			var ret = '{}';
			switch (post.action) {
				case 'postlist':
					ret = postList();
					response.setContentType('application/json');
				break;
				case 'getpost':
					ret = getPost(post);
					response.setContentType('application/json');
				break;
				case 'writepost':
					ret = writePost(post);
					response.setContentType('application/json');
				break;
				case 'previewpost':
					ret = previewPost(post);
					response.setContentType('text/html');
				break;
				default:
					ret = '{}';
					response.setContentType('application/json');
				break;
			}

			response.setContent(ret);
			response.setResponseCode(200);
			response.send()
        });
	} else {
		response.setContent('{}');
		response.setContentType('application/json');
		response.setResponseCode(200);
		response.send()
	}
	return true;
}

function postList() {
	return JSON.stringify(_helper.getPosts());
}

function getPost(post) {
	if (post.postid) {
		return JSON.stringify({id: post.postid, content: _helper.getPost(post.postid)});
	} else {
		return '{}';
	}
}

function writePost(post) {

}

function previewPost(post) {
	if (post.content) {
		return _helper.getPage(post.content);
	}
	return '';
}

function checkApiKey(key) {
	return key === _Config.APIKey;
}

exports.Ajax = Ajax;
