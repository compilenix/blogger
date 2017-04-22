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

		this.setLogLevel(config.Log.Level);
	}

	/**
	 * @public
	 * @param {string} level
	 */
	setLogLevel(level) {
		switch (config.Log.Level.toLowerCase()) {
			case "debug":
				level = this.level.DEBUG;
				break;
			case "info":
				level = this.level.INFO;
				break;
			case "warn":
				level = this.level.WARN;
				break;
			case "error":
				level = this.level.ERROR;
				break;
			default:
				throw new Error(`can't get valid log level. value was: ${config.Log.Level}`);
		}

		this.loggers.forEach((logger) => {
			logger.setLogLevel(level);
		});

		this.logLevel = level;
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
		if (!super.__log(msg, exception, level)) {
			return;
		}

		this.loggers.forEach((logger) => {
			logger.__log(msg, exception, level);
		});
	}
}

module.exports = new LogHandler();
