const Page = require("./Page.js");

class Index {
	/**
	 * Creates an instance of Index.
	 * @param {Server} server
	 * @memberOf Index
	 */
	constructor(server) {
		this.server = server;
		this.response = {
			type: "error",
			code: 500,
			content: "",
			mimetype: "text/plain"
		};
		this.page = new Page();
	}

	/**
	 * @public
	 * @param {http.ClientRequest} request
	 * @returns {Object}
	 * @memberOf Index
	 */
	processRequest(request) {
		switch (request.method) {
			case "GET":
				return this.page.getPage(request, true);
			default:
				this.response.code = 501;
				break;
		}

		return this.response;
	}
}

module.exports = Index;
