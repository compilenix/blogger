const Page = require("./RequestHandlers/Page.js");
const Post = require("./RequestHandlers/Post.js");
const Rss = require("./RequestHandlers/Rss.js");
const Ajax = require("./RequestHandlers/Ajax.js");
const Edit = require("./RequestHandlers/Edit.js");
const Static = require("./RequestHandlers/Static.js");
const Find = require("./RequestHandlers/Find.js");

class RequestHandler {
	constructor() {
		this.handlers = {
			"Index": new Page(),
			"Post": new Post(),
			"Rss": new Rss(),
			"Page": new Page(),
			"Ajax": new Ajax(),
			"Edit": new Edit(),
			"Static": new Static(),
			"Find": new Find()
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
