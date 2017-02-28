const fs = require("fs");
const mustache = require("mustache");
const logger = require("./logger.js");
const config = require("../Config.js");

/** @type {Renderer} */
let instance;

class Renderer {
	constructor() {
		/** @type {Object} */
		this.cache = {};

		this.fields = {
			path: {
				staticContentUri: config.staticContentUri
			},
			title: config.Title,
			author: config.author
		};
	}

	/**
	 * @public
	 * @param {string} category
	 * @param {string} name
	 * @returns {string}
	 * @memberOf Renderer
	 */
	getFSTemplate(category, name) {
		let path = "./" + config.templatePath;

		if (category) {
			path += category + "/";
		}

		path += name;
		if (!this.cache[path]) {
			let stat = fs.statSync(path);

			if (stat.isFile()) {
				this.cache[path] = fs.readFileSync(path, {encoding: "UTF8"});
			} else {
				logger.warn("template not found: " + path);
				return "";
			}
		}

		return this.cache[path];
	}

	/**
	 * @public
	 * @param {string} template
	 * @returns {string} rendered template
	 * @memberOf Renderer
	 */
	render(template) {
		return mustache.render(this._includeTemplatesRecursive(template), this.fields);
	}

	/**
	 * @private
	 * @param {string} template
	 * @returns {string}
	 * @memberOf Renderer
	 */
	_includeTemplates(template) {
		let res = template;
		let regex = /\[\[([A-Za-z0-9]+)\]\]/g;
		let match = regex.exec(template);
		while (match !== null) {
			res = res.replace("[[" + match[1] + "]]", this.getFSTemplate(null, match[1]));
			match = regex.exec(template);
		}

		template = res;

		regex = /\[\[([A-Za-z0-9]+)\.([A-Za-z0-9]+)\]\]/g;
		match = regex.exec(template);
		while (match !== null) {
			res = res.replace("[[" + match[1] + "." + match[2] + "]]", this.getFSTemplate(match[1], match[2]));
			match = regex.exec(template);
		}
		return res;
	}

	/**
	 * @private
	 * @param {string} template
	 * @param {number} [degreeOfRecursion=0]
	 * @param {number} [maxDegreeOfRecursion=10]
	 * @returns {string}
	 * @memberOf Renderer
	 */
	_includeTemplatesRecursive(template, degreeOfRecursion = 0, maxDegreeOfRecursion = 10) {
		let regex = /\[\[([A-Za-z0-9.]+)\]\]/g;
		let match = regex.exec(template);

		if (match !== null && degreeOfRecursion < maxDegreeOfRecursion) {
			return this._includeTemplatesRecursive(this.includeTemplates(template), degreeOfRecursion + 1);
		} else {
			return template;
		}
	}
}

/**
 * @returns {Renderer}
 */
function getRenderer() {
	if (!instance) {
		instance = new Renderer();
	}
	return instance;
}

module.exports = getRenderer();
