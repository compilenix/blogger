const Page = require("./RequestHandlers/Page.js");
const Post = require("./RequestHandlers/Post.js");
const Rss = require("./RequestHandlers/Rss.js");
const Ajax = require("./RequestHandlers/Ajax.js");
const Edit = require("./RequestHandlers/Edit.js");
const Static = require("./RequestHandlers/Static.js");
const Find = require("./RequestHandlers/Find.js");

// TODO rename. something like `RequestHandlerMapper`, `RequestHandlerBootstrapper`, ...
// TODO refactor to base class of every RequestHandler
class RequestHandler {

	/**
	 * Creates an instance of RequestHandler.
	 * @param {Server} server
	 *
	 * @memberOf RequestHandler
	 */
	constructor(server) {
		this.server = server;
		this.handlers = {
			"Index": Page,
			"Post": Post,
			"Rss": Rss,
			"Page": Page,
			"Ajax": Ajax,
			"Edit": Edit,
			"Static": Static,
			"Find": Find
		};
	}

	/**
	 * @public
	 * @param {type} handler
	 * @memberOf RequestHandlers
	 */
	get(handler) {
		return new this.handlers[handler](this.server);
	}
}

module.exports = RequestHandler;
