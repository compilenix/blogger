

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
					ret = postList(response);
					response.setContentType('application/json');
				break;
				case 'getpost':
					ret = getPost(response, post);
					response.setContentType('application/json');
				break;
				case 'writepost':
					ret = writePost(response, post);
					response.setContentType('application/json');
				break;
				case 'previewpost':
					ret = previewPost(response, post);
					response.setContentType('text/html');
				break;
				default:
					ret = '{}';
					response.setResponseCode(400);
					response.setContentType('application/json');
				break;
			}

			response.setContent(ret);
			response.send();
        });
	} else if (request.method == 'GET') {
		var vars = _querystring.parse(request.url);
		if (vars && vars['action'] && vars['action'] == 'previewpost') {
			response.setContentType('text/html');
			response.setContent(previewPost(response, vars));
			response.send();
			return true;
		}
		response.setContent('{}');
		response.setContentType('application/json');
		response.setResponseCode(400);
		response.send()
		return true;
	}
}

function postList(response) {
	response.setResponseCode(200);
	return JSON.stringify({type: 'postlist', list: _helper.getPosts(), titles: _helper.getTitles(true)});
}

function getPost(response, post) {
	if (post.postid) {
		response.setResponseCode(200);
		return JSON.stringify({type: 'post', id: post.postid, content: _helper.getPost(post.postid), title: _helper.getTitle(post.postid)});
	} else {
		response.setResponseCode(400);
		return '{}';
	}
}

function writePost(response, post) {
	if (post && post.content && post.title) {
		response.setResponseCode(200);
		_helper.writePost(post.postid, post.content, post.title);
		return JSON.stringify({type: 'postsaved', id: post.postid});
	} else {
		response.setResponseCode(400);
		return '{}';
	}
}

function previewPost(response, post) {
	if (post.content) {
		response.setResponseCode(200);
		var content = JSON.parse(post.content) || post.content || '';
		return _helper.getPage(content);
	}
	response.setResponseCode(400);
	return '';
}

function checkApiKey(key) {
	return key === _Config.APIKey;
}

exports.Ajax = Ajax;
