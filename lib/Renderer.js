const fs = require("fs");
const os = require("os");

const mustache = require("mustache");

const log = require("./LogHandler.js");
const config = require("../Config.js");

class Renderer {
	constructor() {
		/** @type {Object} */
		this.cache = {};

		this.fields = {
			path: {
				staticContentUri: config.staticContentUri
			},
			File: {
				Fonts: config.Fonts
			},
			title: config.Title,
			author: config.author,
			AuthorEmail: config.authorMail
		};
    }

    // TODO: get from Helper.js and resolve circular dependency of Renderer and Helper
    /**
     * @private
     * @static
	 * @returns {string}
     * @memberOf Renderer
     */
    static GetFsDelimiter() {
		switch (os.platform()) {
			case "win32":
				return "\\";
			default:
				return "/";
		}
	}

	/**
	 * @public
	 * @param {string|null} category
	 * @param {string} name
	 * @returns {string}
	 * @memberOf Renderer
	 */
	getFSTemplate(category, name) {
		let path = `.${Renderer.GetFsDelimiter()}${config.templatePath}`;

		if (category) {
			path += `${category}${Renderer.GetFsDelimiter()}`;
		}

		path += name;
		if (!this.cache[path]) {
			let stat = fs.statSync(path);

			if (stat.isFile()) {
				this.cache[path] = fs.readFileSync(path, {
					encoding: "UTF8"
				});
			} else {
				log.warn(`template not found: ${path}`);
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
		let regex = /\/\*\/\/\/([A-Za-z0-9.]+)\/\/\/\*\//g;
		let match = regex.exec(template);

		while (match !== null) {
			res = res.replace(`/*///${match[1]}///*/`, this.getFSTemplate(null, match[1]));
			match = regex.exec(template);
		}

		template = res;
		regex = /\/\*\/\/\/([A-Za-z0-9]+):([A-Za-z0-9.]+)\/\/\/\*\//g;
		match = regex.exec(template);

		while (match !== null) {
			res = res.replace(`/*///${match[1]}:${match[2]}///*/`, this.getFSTemplate(match[1], match[2]));
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
		let regex = /\/\*\/\/\/([A-Za-z0-9.:]+)\/\/\/\*\//g;
		let match = regex.exec(template);

		if (match !== null && degreeOfRecursion < maxDegreeOfRecursion) {
			return this._includeTemplatesRecursive(this._includeTemplates(template), degreeOfRecursion + 1);
		} else {
			return template;
		}
	}
}

module.exports = Renderer;
