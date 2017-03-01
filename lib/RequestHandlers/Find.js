const querystring = require("querystring");
const url = require("url");

const Helper = require("../Helper.js");
const config = require("../../Config.js");

class Find {
	/**
	 * Creates an instance of Find.
	 * @param {Server} server
	 * @memberOf Find
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
	 * @memberOf Find
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
		let query = (() => {
			let query = querystring.parse(url.parse(request.url).query);
			let tmp = null;

			Object.keys(query).forEach((member) => {
				if (query[member] !== " ") {
					tmp = query[member];
				}
			});

			query = querystring.unescape(tmp);
			return query;
		})();

		if (query == "null") {
			query = querystring.unescape(request.url.split("/").pop());
		}

		const postsData = [];
		const postIds = [];
		const matched = [];
		const cacheDependencies = [config.post.FileHeader, config.post.FileFooter];
		let content = "<ul>\n";

		if (!query) {
			return this.response;
		}

		if (!query.match(/[\w\d\s\-]+$/)) {
			return this.response;
		}

		const regex = new RegExp(query, "igm");
		const posts = Helper.getAllPostIds(false);

		for (let index = 0; index < posts.length; index++) {
			const postId = posts[index];
			postsData.push(Helper.getPost(posts[index]));
			postIds.push(postId);
		}

		for (let index = 0; index < postsData.length; index++) {
			const postData = postsData[index];
			const postId = posts[index];
			let match = postData.title.match(regex);

			if (match) {
				cacheDependencies.push(config.post.DirectoryPosts + Helper.GetFsDelimiter() + postId + ".json");
				matched.push(index);
				continue;
			}

			match = postData.contents.match(regex);
			if (match) {
				cacheDependencies.push(config.post.DirectoryPosts + Helper.GetFsDelimiter() + postId + ".json");
				matched.push(index);
				continue;
			}
		}

		if (matched.length < 1) {
			return this.response;
		}

		for (let index = 0; index < matched.length; index++) {
			const match = matched[index];
			const postData = postsData[match];
			const postId = posts[match];
			content += "<li>";
			content += "[<a href=\"/post/" + postId + "\">" + postData.title + "</a>] <br><br>";
			content += postData.contents;
			content += "</li>\n";
		}

		content += "</ul>\n\n";

		return {
			type: "content",
			code: 200,
			content: Helper.getPage(content, "Results of: " + query),
			mimetype: "text/html"
		};
	}
}

module.exports = Find;
