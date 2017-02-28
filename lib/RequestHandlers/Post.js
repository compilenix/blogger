const Helper = require("../Helper.js");

class Post {
	/**
	 * Creates an instance of Post.
	 * @param {Server} server
	 * @memberOf Post
	 */
	constructor(server) {
		this.server = server;
		this.response = {
			type: "error",
			code: 404,
			content: "nothing found!",
			mimetype: "text/plain"
		};
	}

	/**
	 * @public
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Post
	 */
	processRequest(request) {
		switch (request.method) {
			case "GET":
				return this._processRequest(request);
			default:
				this.response.code = 501;
				break;
		}

		return this.response;
	}

	_processRequest(request) {
		this.response = {
			type: "error",
			code: 404,
			content: "post not found!",
			mimetype: "text/plain"
		};

		let data;
		const query = request.url.split("/").pop();
		if ((query && query.match(/^[A-Za-z0-9]+$/)) && (data = Helper.getPost(query)) !== "") {
			if (data.title) {
				this.response.content = Helper.getPage(data.contents, data.title);
			} else {
				this.response.content = Helper.getPage(data.contents);
			}

			this.response.type = "content";
			this.response.code = 200;
			this.response.mimetype = "text/html";
		}

		return this.response;
	}
}

module.exports = Post;
