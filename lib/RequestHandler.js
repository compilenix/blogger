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
		this.handlers = {
			"Index": new Page(server),
			"Post": new Post(server),
			"Rss": new Rss(server),
			"Page": new Page(server),
			"Ajax": new Ajax(server),
			"Edit": new Edit(server),
			"Static": new Static(server),
			"Find": new Find(server)
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
