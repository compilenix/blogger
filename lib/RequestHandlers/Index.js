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
		let res;
		switch (request.method) {
			case "GET":
				res = this.page.getPage(request, true);
				this.response.content = res.content;

				if (this.response.content !== "") {
					this.response.type = res.type;
					this.response.code = res.code;
					this.response.mimetype = res.mimetype;
				}
				break;
			default:
				this.response.code = 501;
				break;
		}

		return this.response;
	}
}

module.exports = Index;
