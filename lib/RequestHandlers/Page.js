const fs = require("fs");

const Helper = require("../Helper.js");

const config = require("../../Config.js");

class Page {
	/**
	 * Creates an instance of Page.
	 * @param {Server} server
	 * @memberOf Page
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
	 * @memberOf Page
	 */
	processRequest(request) {
		switch (request.method) {
			case "GET":
				return this.getPage(request, false);
			default:
				this.response.code = 501;
				break;
		}

		return this.response;
	}

	getPage(request, getStartPage) {
		const posts = Helper.getPosts(true);
		const pageCount = Math.ceil(posts.length / config.post.CountPosts);
		const deps = [config.post.FileHeader, config.post.FileFooter];
		let title = "";
		let requestsToPush = [];

		if (getStartPage && config.EnableHttp2 && config.Https.Enabled) {
			requestsToPush.push(
				{
					path: config.staticContentUri + "Ubuntu-R.ttf",
					data: fs.readFileSync(config.staticContentPath + "Ubuntu-R.ttf", null),
					httpCode: 200,
					header: {
						"Content-Type": "application/x-font-truetype",
						"Last-Modified": new Date(fs.statSync(config.staticContentPath + "Ubuntu-R.ttf").mtime).toUTCString(),
						"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
					}
				},
				{
					path: config.staticContentUri + "Ubuntu-B.ttf",
					data: fs.readFileSync(config.staticContentPath + "Ubuntu-B.ttf", null),
					httpCode: 200,
					header: {
						"Content-Type": "application/x-font-truetype",
						"Last-Modified": new Date(fs.statSync(config.staticContentPath + "Ubuntu-B.ttf").mtime).toUTCString(),
						"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
					}
				},
				{
					path: config.staticContentUri + "SourceCodePro-Regular.ttf.woff2",
					data: fs.readFileSync(config.staticContentPath + "SourceCodePro-Regular.ttf.woff2", null),
					httpCode: 200,
					header: {
						"Content-Type": "application/font-woff2",
						"Last-Modified": new Date(fs.statSync(config.staticContentPath + "SourceCodePro-Regular.ttf.woff2").mtime).toUTCString(),
						"Expires": new Date(Date.now() + (config.HeaderExpires || 60000 * 10)).toUTCString()
					}
				}
			);
		}

		if (posts.length < 1) {
			return {
				type: "content",
				code: 200,
				content: Helper.getPage("Nothing here, yet.", "Start Page"),
				mimetype: "text/html"
			};
		}

		let pageNumber;
		if (!getStartPage) {
			pageNumber = parseInt(request.url.split("/").pop());

			if (isNaN(pageNumber) || pageNumber < 1) {
				pageNumber = 1;
			}

			if (pageNumber > pageCount) {
				pageNumber = pageCount;
			}

			title = "Page " + pageNumber;
		} else {
			pageNumber = pageCount;
			title = "Start page";
		}

		let content = "<ul>\n";
		const lastPost = pageNumber * config.post.CountPosts;
		const firstPost = lastPost - config.post.CountPosts;
		for (let i = lastPost; i > firstPost; i--) {
			if (posts[i - 1]) {
				const data = Helper.getPost(posts[i - 1]);
				content += "<li>";
				content += "[<a href=\"/post/" + posts[i - 1] + "\">" + data.title + "</a>] <br><br>";
				content += data.contents;
				content += "</li>\n";
				deps.push(config.post.DirectoryPosts + Helper.GetFsDelimiter() + posts[i - 1] + ".json");
			}
		}

		content += "</ul>\n\n";

		if (pageNumber == 1) {
			content += "<div style=\"text-align:center\"><h2>" + config.post.MessageEnd + "</h2></div>";
		}

		content += "<div style=\"text-align:center\">";

		let older;
		if (pageNumber < pageCount) {
			older = "<a href=\"/page/" + (pageNumber + 1) + "\">" + config.post.MessageNewerPage + "</a>";
		}

		let newer;
		if (pageNumber > 1) {
			newer = "<a href=\"/page/" + (pageNumber - 1) + "\">" + config.post.MessageOlderPage + "</a>";
		}

		if (older && newer) {
			content += older + " <-> " + newer;
		} else if (older) {
			content += older;
		} else if (newer) {
			content += newer;
		}

		content += "</div>\n";

		return {
			type: "content",
			code: 200,
			content: Helper.getPage(content, title),
			mimetype: "text/html",
			push: requestsToPush
		};
	}
}

module.exports = Page;
