

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
				break;
				case 'getpost':
					ret = getPost(post);
				break;
				case 'writepost':
					ret = writePost(post);
				break;
				default:
					ret = '{}';
				break;
			}

			response.setContent(ret);
			response.setContentType('application/json');
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

function writePost(request) {

}

function checkApiKey(key) {
	return key === _Config.APIKey;
}

exports.Ajax = Ajax;
