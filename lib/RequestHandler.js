const Page = require("./RequestHandlers/Page.js");
const Index = require("./RequestHandlers/Index.js");
const Post = require("./RequestHandlers/Post.js");
const Rss = require("./RequestHandlers/Rss.js");
const Ajax = require("./RequestHandlers/Ajax.js");
const Edit = require("./RequestHandlers/Edit.js");
const Static = require("./RequestHandlers/Static.js");
const Find = require("./RequestHandlers/Find.js");
const Code = require("./RequestHandlers/Code.js");

const handlers = {
	Index: Index,
	Post: Post,
	Rss: Rss,
	Page: Page,
	Ajax: Ajax,
	Edit: Edit,
	Static: Static,
	Code: Code,
	Find: Find
};

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
	}

	/**
	 * @public
	 * @param {string} handler name
	 * @memberOf RequestHandlers
	 */
	get(handler) {
		return new handlers[handler](this.server);
	}
}

module.exports = RequestHandler;
