const Logger = require("./Logger.js");
const fs = require("fs");
const config = require("../../Config.js");
const Helper = require("../Helper.js");

class FileLogger extends Logger {
	constructor() {
		super();

		if (!fs.existsSync(config.Log.File.Path)) {
			fs.mkdirSync(config.Log.File.Path);
		}
	}

	/**
	 * @private
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 */
	__log(msg, exception, level) {
		if (!level.numeric && !config.Log.File.Path) {
			return;
		}

		let file = `${config.Log.File.Path}${Helper.GetFsDelimiter()}Blogger`;
		if (config.Log.File.FilePerLoglevel) {
			switch (level.numeric) {
				case this.level.DEBUG.numeric:
					file += ".Debug";
					break;
				case this.level.INFO.numeric:
					file += ".Info";
					break;
				case this.level.WARN.numeric:
					file += ".Warn";
					break;
				case this.level.ERROR.numeric:
					file += ".Error";
					break;
				default:
					break;
			}
		}

		fs.appendFile(file + ".log", this.__formatMessage(msg, exception, level) + "\n", () => {});
	}
}

module.exports = FileLogger;
