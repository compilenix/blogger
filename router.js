function Route(callback, request) {

	if (typeof callback === 'function') {
		return callback(request);
	} else {
		console.log('Request handler found for: "' + _url.parse(request.url).pathname + '" but callback is not a function: "' + callback + '"!');
		return  {
			type: 'error',
			code: 404

		}
	}
}

exports.Route = Route;
