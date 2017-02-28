const querystring = require("querystring");

const Helper = require("../Helper.js");

const config = require("../../Config.js");

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
	 *
	 * @memberOf Ajax
	 */
	processRequest(request) {
		switch (request.method) {
			case "POST":
				return this.processPost;
			case "GET":
				this.response.content = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
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
	 * @param {string} data post data
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Ajax
	 */
	processPost(data, request) {
		this.response = {
			type: "error",
			code: 500
		};

		const post = querystring.parse(data);

		if (!this.checkPermission(post.ApiKey)) {
			return this.response;
		}

		if (!post.action) {
			this.response.type = "error";
			this.response.code = 400;
			this.response.mimetype = "application/json";
			this.response.content = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
			return this.response;
		}

		/** @type {string} */
		let dataToReturn;
		switch (post.action) {
			case "postlist":
				dataToReturn = this.postList();
				this.response.mimetype = "application/json";
				this.response.code = 200;
				break;
			case "getpost":
				dataToReturn = this.getPost(post);
				this.response.mimetype = "application/json";

				if (dataToReturn === "{}") {
					dataToReturn = "{\n\t\"code\": 404,\n\t\"content\": \"Not Found\"\n}";
					this.response.code = 404;
				} else {
					this.response.code = 200;
				}
				break;
			case "writepost":
				dataToReturn = this.writePost(post);
				this.response.mimetype = "application/json";

				if (dataToReturn === "{}") {
					dataToReturn = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
					this.response.code = 400;
				} else {
					this.response.code = 200;
				}
				break;
			case "removepost":
				dataToReturn = this.removePost(post);
				this.response.mimetype = "application/json";

				if (dataToReturn === "{}") {
					dataToReturn = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
					this.response.code = 400;
				} else {
					this.response.code = 200;
				}
				break;
			case "previewpost":
				dataToReturn = this.previewPost(post);
				this.response.mimetype = "text/html";

				if (dataToReturn === "") {
					this.response.code = 400;
				} else {
					this.response.code = 200;
				}
				break;
			default:
				dataToReturn = "{}";
				this.response.code = 400;
				this.response.mimetype = "application/json";
				break;
		}

		this.response.content = dataToReturn;
		return this.response;
	}

	/**
	 * @public
	 * @returns {string} json stringified postlist { type: "postlist", list: string[], titles: string[] }
	 * @memberOf Ajax
	 */
	postList() {
		return JSON.stringify({ type: "postlist", list: Helper.getAllPostIds(true), titles: Helper.getTitles(true) });
	}

	/**
	 * @public
	 * @param {Object} post
	 * @returns {string} json stringified post { type: "post", id: string, content: string, title: string }
	 * @memberOf Ajax
	 */
	getPost(post) {
		if (post.postid) {
			return JSON.stringify({ type: "post", id: post.postid, content: Helper.getPost(post.postid), title: Helper.getTitle(post.postid) });
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
			return JSON.stringify({ type: "postsaved", id: post.postid });
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
				return JSON.stringify({ type: "postremoved", id: post.postid });
			} else {
				return JSON.stringify({ type: "postnotfound", id: post.postid });
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
