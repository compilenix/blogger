class RequestHandler {
	constructor() {
		this.handlers = {
			"Index": require("./RequestHandlers/Page.js"),
			"Post": require("./RequestHandlers/Post.js"),
			"RSS": require("./RequestHandlers/RSS.js"),
			"Page": require("./RequestHandlers/Page.js"),
			"Ajax": require("./RequestHandlers/Ajax.js"),
			"Edit": require("./RequestHandlers/Edit.js"),
			"Static": require("./RequestHandlers/Static.js"),
			"Find": require("./RequestHandlers/Find.js")
		};
	}

	/**
	 * @public
	 * @param {type} handler
	 * @memberOf RequestHandlers
	 */
	get(handler) {
		return this.handlers[handler];
	}
}

module.exports = RequestHandler;
