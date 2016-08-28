var instance;
var fs = require("fs");
var logger = require("./logger.js");

class Renderer {
	constructor() {
		this.mustache = require("mustache");
		this.cache = {};

	}

	getFSTemplate(category, name) {
		var path = "./" + global.Config.templatePath;
		if (category) {
			path += category + "/";
		}
		path += name;
		if (!this.cache[path]) {
			var stat = fs.statSync(path);
			if (stat.isFile()) {
				this.cache[path] = fs.readFileSync(path, {encoding: "UTF8"});
			} else {
				logger.warn("template not found: " + path);
				return "";
			}
		}

		return this.cache[path];
	}

	includeTemplates(template) {
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

	includeTemplatesRecursive(template, i) {
		var regex = /\[\[([A-Za-z0-9.]+)\]\]/g;
		var match = regex.exec(template);
		if (match !== null && i < 10) {

			return this.includeTemplatesRecursive(this.includeTemplates(template), i + 1);
		} else {
			return template;
		}
	}

	render (template) {
		return this.includeTemplatesRecursive(template, 0);
	}
}



function getRenderer() {
	if (!instance) {
		instance = new Renderer();
	}
	return instance;
}

module.exports = getRenderer();
