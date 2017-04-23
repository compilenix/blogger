const querystring = require("querystring");

const Helper = require("../Helper.js");

const config = require("../../Config.js");
const log = require("../LogHandler.js");

class Ajax {
	/**
	 * Creates an instance of Ajax.
	 * @param {Server} server
	 * @memberOf Ajax
	 */
	constructor(server) {
		this.server = server;
		this.response = {
			type: "error",
			code: 500,
			content: "",
			mimetype: "text/plain"
		};
	}

	/**
	 * @public
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Ajax
	 */
	processRequest(request) {
		switch (request.method) {
			case "POST":
				return this.processPost;
			case "GET":
				this.response.content = `{ "code": 400, "content": "Bad Request" }`;
				this.response.mimetype = "application/json";
				this.response.code = 400;
				break;
			default:
				this.response.code = 501;
				break;
		}

		return this.response;
	}

	/**
	 * @public
	 * @param {string} permission
	 * @returns {boolean}
	 * @memberOf Ajax
	 */
	checkPermission(permission) {
		if (!this.checkApiKey(permission)) {
			this.response.content = "{}";
			this.response.mimetype = "application/json";
			this.response.code = 403;
			return false;
		}

		return true;
	}

	/**
	 * @public
	 * @param {Ajax} ajax
	 * @param {string} data post data
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Ajax
	 */
	processPost(ajax, data, request) {
		ajax.response = {
			type: "error",
			code: 500
		};

		const post = querystring.parse(data);

		log.debug(`Ajax received a post: ${JSON.stringify(post)}`);

		if (!ajax.checkPermission(post.ApiKey)) {
			log.debug(`Ajax post was rejected for api key: ${post.ApiKey}`);
			return ajax.response;
		}

		if (!post.action) {
			ajax.response.type = "error";
			ajax.response.code = 400;
			ajax.response.mimetype = "application/json";
			ajax.response.content = `{ "code": 400, "content": "Bad Request" }`;
			log.debug(`Ajax post was rejected for non existing post.action`);
			return ajax.response;
		}

		/** @type {string} */
		let dataToReturn;
		switch (post.action) {
			case "postlist":
				log.debug(`Ajax post is a "postlist"`);
				dataToReturn = ajax.postList();
				ajax.response.mimetype = "application/json";
				ajax.response.code = 200;
				log.debug(`Ajax "postlist" resulted in ` + "\n" + `${dataToReturn}`);
				break;
			case "getpost":
				log.debug(`Ajax post is a "getpost"`);
				dataToReturn = ajax.getPost(post);
				ajax.response.mimetype = "application/json";

				if (dataToReturn === "{}") {
					dataToReturn = `{ "code": 404, "content": "Not Found" }`;
					ajax.response.code = 404;
				} else {
					ajax.response.code = 200;
				}
				break;
			case "writepost":
				log.debug(`Ajax post is a "writepost"`);
				dataToReturn = ajax.writePost(post);
				ajax.response.mimetype = "application/json";

				if (dataToReturn === "{}") {
					dataToReturn = `{ "code": 400, "content": "Bad Request" }`;
					ajax.response.code = 400;
				} else {
					ajax.response.code = 200;
				}
				break;
			case "removepost":
				log.debug(`Ajax post is a "removepost"`);
				dataToReturn = ajax.removePost(post);
				ajax.response.mimetype = "application/json";

				if (dataToReturn === "{}") {
					dataToReturn = `{ "code": 400, "content": "Bad Request" }`;
					ajax.response.code = 400;
				} else {
					ajax.response.code = 200;
				}
				break;
			case "previewpost":
				log.debug(`Ajax post is a "previewpost"`);
				dataToReturn = ajax.previewPost(post);
				ajax.response.mimetype = "text/html";

				if (dataToReturn === "") {
					ajax.response.code = 400;
				} else {
					ajax.response.code = 200;
				}
				break;
			default:
				log.debug(`Ajax post action could not be found: ${post.action}`);
				dataToReturn = "{}";
				ajax.response.code = 400;
				ajax.response.mimetype = "application/json";
				break;
		}

		ajax.response.content = dataToReturn;
		return ajax.response;
	}

	/**
	 * @public
	 * @returns {string} json stringified postlist { type: "postlist", list: string[], titles: string[] }
	 * @memberOf Ajax
	 */
	postList() {
		return JSON.stringify({
			type: "postlist",
			list: Helper.getAllPostIds(true),
			titles: Helper.getTitles(true)
		});
	}

	/**
	 * @public
	 * @param {Object} post
	 * @returns {string} json stringified post { type: "post", id: string, content: string, title: string }
	 * @memberOf Ajax
	 */
	getPost(post) {
		if (post.postid) {
			return JSON.stringify({
				type: "post",
				id: post.postid,
				content: Helper.getPost(post.postid),
				title: Helper.getTitle(post.postid)
			});
		} else {
			return "{}";
		}
	}

	/**
	 * @public
	 * @param {Object} post
	 * @returns {string} json stringified { type: "postsaved", id: string }
	 * @memberOf Ajax
	 */
	writePost(post) {
		if (post && post.content && post.title) {
			Helper.writePost(post.postid, post.content, post.title);
			// TODO clear only needed stuff
			this.server.cache.clear();
			return JSON.stringify({
				type: "postsaved",
				id: post.postid
			});
		} else {
			return "{}";
		}
	}

	/**
	 * @public
	 * @param {Object} post
	 * @returns json stringified { type: "postremoved" | "postnotfound", id: string }
	 * @memberOf Ajax
	 */
	removePost(post) {
		if (post && post.postid) {
			if (Helper.removePost(post.postid)) {
				// TODO clear only needed stuff
				this.server.cache.clear();
				return JSON.stringify({
					type: "postremoved",
					id: post.postid
				});
			} else {
				return JSON.stringify({
					type: "postnotfound",
					id: post.postid
				});
			}
		} else {
			return "{}";
		}
	}

	/**
	 * @public
	 * @param {Object} post
	 * @returns {string} post content
	 * @memberOf Ajax
	 */
	previewPost(post) {
		if (post.content) {
			return Helper.getPage(JSON.parse(post.content) || post.content || "", post.title || undefined);
		}
		return;
	}

	/**
	 * @public
	 * @param {string} key
	 * @returns {boolean}
	 * @memberOf Ajax
	 */
	checkApiKey(key) {
		return key === config.ApiKey;
	}
}

module.exports = Ajax;
