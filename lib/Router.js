var logger = require("./logger.js");

class Router {
	/**
	 * Creates an instance of Router.
	 * @param {Array} mappings
	 * @memberOf Router
	 */
	constructor(mappings) {
		this.requestHandlersMappings = mappings;
	}

	/**
	 * @public
	 * @param {string} pathname
	 * @param {http.IncomingMessage} request
	 * @returns {Object} response object from RequestHandler
	 * @memberOf Router
	 */
	route(pathname, request) {
		const callback = this.routeGetCallback(pathname);

		if (typeof callback === "function") {
			return callback(request);
		}

		logger.debug("Request handler found for: \"" + pathname + "\" or callback is not a function: " + callback + "!");
		return { type: "error", code: 404 };
	}

	/**
	 * @public
	 * @param {string} pathname
	 * @returns {boolean}
	 * @memberOf Router
	 */
	routeExists(pathname) {
		return typeof this.getRoute(pathname).callback === "function";
	}

	/**
	 * @public
	 * @param {string} pathname
	 * @returns {function}
	 * @memberOf Router
	 */
	routeGetCallback(pathname) {
		return this.getRoute(pathname).callback;
	}

	/**
	 * @public
	 * @param {string} pathname
	 * @returns {boolean} If the result of this request should be cached
	 * @memberOf Router
	 */
	routeGetCacheEnabled(pathname) {
		return this.getRoute(pathname).cache;
	}

	// TODO see @RequestHandler or to be more specific -> RequestHandlerMapper, RequestHandlerBootstrapper, or whatever
	/**
	 * @public
	 * @param {string} pathname
	 * @returns {Object|boolean} the requested route object or false
	 * @memberOf Router
	 */
	getRoute(pathname) {
		for (var i = 0; i < this.requestHandlersMappings.length; i++) {
			if (this.requestHandlersMappings[i].match.test(pathname)) {
				return this.requestHandlersMappings[i];
			}
		}
		return false;
	}
}

module.exports = Router;
