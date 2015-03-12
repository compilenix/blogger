function Ajax(request, response) {

	if (request.method == 'POST') {
		var body = '';
       	request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var post = qs.parse(body);

            if (!checkApiKey(post.apikey)) {
            	response.setContent('{}');
				response.setContentType('application/json');
				response.setResponseCode(403);
				response.send();
				return false;
            }

			var ret = '{}';
			switch (action) {
				case 'postlist':
					ret = postList(request);
				break;
				case 'getpost':
					ret = getPost(request);
				break;
				case 'writepost':
					ret = writePost(request);
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

function postList(request) {

}

function getPost(request) {

}

function writePost(request) {

}

exports.Ajax = Ajax;
