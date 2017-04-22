const os = require("os");
const fs = require("fs");
const htmlencode = require("htmlencode").htmlEncode;

const config = require("../Config.js");

class Helper {

	/**
	 * @public
	 * @static
	 * @param {boolean} reverseOrder
	 * @returns {string[]}
	 * @memberOf Helper
	 */
	static getAllPostIds(reverseOrder) {
		const data = [];
		let posts;

		posts = fs.readdirSync(config.post.DirectoryPosts);

		if (reverseOrder) {
			posts = posts.reverse();
		}

		for (let i = 0; i < posts.length; i++) {
			let id = posts[i].replace(".json", "");

			if (this.getPostIfIsValid(id) && fs.existsSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${posts[i]}.asc`)) {
				data.push(id);
			}
		}

		return data;
	}

	/**
	 * @public
	 * @static
	 * @param {string} id
	 * @returns {string}
	 * @memberOf Helper
	 */
	static getTitle(id) {
		return this.getPost(id).title;
	}

	/**
	 * @public
	 * @static
	 * @param {bool} reverseOrder
	 * @returns
	 * @memberOf Helper
	 */
	static getTitles(reverseOrder) {
		const data = [];
		let list = this.getAllPostIds(reverseOrder);

		for (let i = 0; i < list.length; i++) {
			data.push(this.getTitle(list[i]));
		}

		return data;
	}

	/**
	 * @public
	 * @static
	 * @param {string} id
	 * @param {string} content
	 * @param {string} title
	 * @memberOf Helper
	 */
	static writePost(id, content, title) {
		const data = JSON.stringify({
			title: title,
			contents: content
		});

		fs.writeFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`, data, "utf8");
		fs.writeFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`, "", "utf8");
	}

	/**
	 * @public
	 * @static
	 * @param {string} id
	 * @returns {boolean} true if the post existed and has been removed
	 * @memberOf Helper
	 */
	static removePost(id) {
		if (this.postExists(id)) {
			fs.unlinkSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`);
			fs.unlinkSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`);
			return true;
		}
		return false;
	}

	/**
	 * @public
	 * @static
	 * @param {string} id
	 * @returns {boolean}
	 * @memberOf Helper
	 */
	static postExists(id) {
		if (!fs.existsSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`)) {
			return false;
		}

		try {
			fs.accessSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`, fs.R_OK);
		} catch (error) {
			return false;
		}

		return true;
	}

	/**
	 * @public
	 * @static
	 * @param {string} id
	 * @returns {boolean|string} false if invalid or does not exists else return post object
	 * @memberOf Helper
	 */
	static getPostIfIsValid(id) {
		let data;

		if (!this.postExists(id)) {
			return false;
		}

		if ((data = fs.readFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`, "utf8")).length < 26) {
			return false;
		}

		try {
			data = JSON.parse(data);
		} catch (error) {
			return false;
		}

		if (data.title && data.contents) {
			return data;
		}

		return false;
	}

	/**
	 * @public
	 * @static
	 * @param {string} id
	 * @returns {null|string}
	 * @memberOf Helper
	 */
	static getPost(id) {
		let data;

		if ((data = this.getPostIfIsValid(id))) {
			return data;
		} else {
			return null;
		}
	}

	// TODO use Renderer insted!
	// TODO remove
	/**
	 * @public
	 * @static
	 * @param {string} title
	 * @param {string} header
	 * @returns {string} prepared header
	 * @memberOf Helper
	 */
	static prepareHeaderHtml(title, header) {
		if (!header) {
			header = fs.readFileSync(`lib${this.GetFsDelimiter()}${config.post.FileHeader}`, "utf8");
		}

		if (title && title !== undefined && title != null) {
			header = this.replaceAll("{{Title}}", htmlencode(`${config.Title} - ${title}`), header);
		} else {
			header = this.replaceAll("{{Title}}", htmlencode(config.Title), header);
		}

		header = this.replaceAll("{{Author}}", htmlencode(config.author), header);
		header = this.replaceAll("{{StaticContent_Ubuntu-R}}", config.staticContentUri + "Ubuntu-R.ttf", header);
		header = this.replaceAll("{{StaticContent_Ubuntu-B}}", config.staticContentUri + "Ubuntu-B.ttf", header);
		header = this.replaceAll("{{StaticContent_ace.js}}", config.staticContentUri + "ace.js", header);
		header = this.replaceAll("{{StaticContent_jquery.js}}", config.staticContentUri + "jquery.js", header);
		header = this.replaceAll("{{StaticContent_mode-html.js}}", config.staticContentUri + "mode-html.js", header);
		header = this.replaceAll("{{StaticContent_worker-html.js}}", config.staticContentUri + "worker-html.js", header);
		header = this.replaceAll("{{StaticContent_theme-monokai.js}}", config.staticContentUri + "theme-monokai.js", header);
		header = this.replaceAll("{{StaticContent_sweetalert.min.js}}", config.staticContentUri + "sweetalert.min.js", header);
		header = this.replaceAll("{{StaticContent_sweetalert.css}}", config.staticContentUri + "sweetalert.css", header);
		header = this.replaceAll("{{StaticContent_inactivel.png}}", config.staticContentUri + "inactivel.png", header);
		header = this.replaceAll("{{StaticContent_inactiver.png}}", config.staticContentUri + "inactiver.png", header);
		header = this.replaceAll("{{StaticContent_inactivec.png}}", config.staticContentUri + "inactivec.png", header);
		header = this.replaceAll("{{StaticContent_activec.png}}", config.staticContentUri + "activec.png", header);
		header = this.replaceAll("{{StaticContent_inactiveclose.png}}", config.staticContentUri + "inactiveclose.png", header);
		header = this.replaceAll("{{StaticContent_activeclose.png}}", config.staticContentUri + "activeclose.png", header);
		header = this.replaceAll("{{StaticContent_activel.png}}", config.staticContentUri + "activel.png", header);
		header = this.replaceAll("{{StaticContent_activer.png}}", config.staticContentUri + "activer.png", header);
		header = this.replaceAll("{{StaticContent_doc.png}}", config.staticContentUri + "doc.png", header);
		header = this.replaceAll("{{StaticContent_arrow_left.png}}", config.staticContentUri + "arrow_left.png", header);
		header = this.replaceAll("{{StaticContent_arrow_right.png}}", config.staticContentUri + "arrow_right.png", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Regular.eot}}", config.staticContentUri + "SourceCodePro-Regular.eot", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Regular.ttf.woff2}}", config.staticContentUri + "SourceCodePro-Regular.ttf.woff2", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Regular.otf.woff}}", config.staticContentUri + "SourceCodePro-Regular.otf.woff", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Regular.otf}}", config.staticContentUri + "SourceCodePro-Regular.otf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Regular.ttf}}", config.staticContentUri + "SourceCodePro-Regular.ttf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-It.eot}}", config.staticContentUri + "SourceCodePro-It.eot", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-It.ttf.woff2}}", config.staticContentUri + "SourceCodePro-It.ttf.woff2", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-It.otf.woff'}}", config.staticContentUri + "SourceCodePro-It.otf.woff'", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-It.otf}}", config.staticContentUri + "SourceCodePro-It.otf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-It.ttf}}", config.staticContentUri + "SourceCodePro-It.ttf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Bold.eot}}", config.staticContentUri + "SourceCodePro-Bold.eot", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Bold.ttf.woff2}}", config.staticContentUri + "SourceCodePro-Bold.ttf.woff2", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Bold.otf.woff}}", config.staticContentUri + "SourceCodePro-Bold.otf.woff", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Bold.otf}}", config.staticContentUri + "SourceCodePro-Bold.otf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-Bold.ttf}}", config.staticContentUri + "SourceCodePro-Bold.ttf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-BoldIt.eot}}", config.staticContentUri + "SourceCodePro-BoldIt.eot", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-BoldIt.ttf.woff2}}", config.staticContentUri + "SourceCodePro-BoldIt.ttf.woff2", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-BoldIt.otf.woff}}", config.staticContentUri + "SourceCodePro-BoldIt.otf.woff", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-BoldIt.otf}}", config.staticContentUri + "SourceCodePro-BoldIt.otf", header);
		header = this.replaceAll("{{StaticContent_SourceCodePro-BoldIt.ttf}}", config.staticContentUri + "SourceCodePro-BoldIt.ttf", header);

		return header;
	}

	/**
	 * @public
	 * @static
	 * @param {string} content
	 * @param {string} title
	 * @returns {string}
	 * @memberOf Helper
	 */
	static getPage(content, title) {
		const footer = fs.readFileSync(`lib${this.GetFsDelimiter()}${config.post.FileFooter}`, "utf8");
		const header = this.prepareHeaderHtml(title);
		return header + content + footer;
	}

	/**
	 * @public
	 * @static
	 * @param {string} find
	 * @param {string} replace
	 * @param {string} str
	 * @returns {string}
	 * @memberOf Helper
	 */
	static replaceAll(find, replace, str) {
		return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), replace);
	}

	/**
	 * @public
	 * @static
	 * @returns {string}
	 * @memberOf Helper
	 */
	static GetFsDelimiter() {
		switch (os.platform()) {
			case "win32":
				return "\\";
			default:
				return "/";
		}
	}
}

module.exports = Helper;
