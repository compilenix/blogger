var logger = require("./logger.js");

// TODO transform into class
function Route(pathname, request) {

	const callback = RouteGetCallback(pathname);

	if (typeof callback === "function") {
		return callback(request);
	}

	logger.debug("Request handler found for: \"" + pathname + "\" or callback is not a function: " + callback + "!");
	return { type: "error", code: 404 };
}

function RouteExists(pathname) {
	return typeof GetRoute(pathname).callback === "function";
}

function RouteGetCallback(pathname) {
	return GetRoute(pathname).callback;
}

function RouteGetCacheEnabled(pathname) {
	return GetRoute(pathname).cache;
}

function GetRoute(pathname) {
	for (var i = 0; i < global.handle.length; i++) {
		if (global.handle[i].match.test(pathname)) {
			return global.handle[i];
		}
	}
	return false;
}

exports.Route = Route;
exports.RouteExists = RouteExists;
exports.RouteGetCallback = RouteGetCallback;
exports.RouteGetCacheEnabled = RouteGetCacheEnabled;
exports.GetRoute = GetRoute;
