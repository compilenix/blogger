const Logger = require("./Logger/Logger.js");
const FileLogger = require("./Logger/FileLogger.js");
const ConsoleLogger = require("./Logger/ConsoleLogger.js");
const config = require("../Config.js");

class LogHandler extends Logger {
	constructor() {
		super();
		this.loggers = [];

		if (config.Log.Console.Enabled) {
			this.loggers.push(new ConsoleLogger());
		}

		if (config.Log.File.Enabled) {
			this.loggers.push(new FileLogger());
		}
	}

	/**
	 * @private
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 * @returns {string}
	 */
	__formatMessage(msg, exception, level) {
		return msg;
	}


	/**
	 * @private
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 */
	__log(msg, exception, level) {
		if (!level.numeric) {
			return;
		}

		this.loggers.forEach((logger) => {
			logger.__log(msg, exception, level);
		});
	}
}

module.exports = new LogHandler();
