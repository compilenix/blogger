const os = require("os");
const fs = require("fs");

const Renderer = require("./Renderer.js");

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

	/**
	 * @public
	 * @static
	 * @param {string} content
	 * @param {string} title
	 * @returns {string}
	 * @memberOf Helper
	 */
	static getPage(content, title) {
		const renderer = new Renderer();
		renderer.fields.title = title;
		renderer.fields.File.Fonts = config.Fonts;
		const header = renderer.render(fs.readFileSync("templates" + this.GetFsDelimiter() + config.post.FileHeader, "utf8"));
		const footer = renderer.render(fs.readFileSync("templates" + this.GetFsDelimiter() + config.post.FileFooter, "utf8"));
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
