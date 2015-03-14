function Code(request, response, write_cache) {
	var query = _querystring.parse(_url.parse(request.url).query)["c"];

	response.setResponseCode(parseInt(query));
	_responseCodeMessage.responseCodeMessage(response);
	if (write_cache) {
		_cache.add(request, response.getContent(), response.getContentType(), response.getResponseCode());
		response.setLastModified(_cache.getLastModified(request));
	}
	response.send();
	return true;
}

exports.Code = Code;
