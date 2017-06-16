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
		let logLevel = this.level.ERROR;
		switch (config.Log.Level.toLowerCase()) {
			case "debug":
				logLevel = this.level.DEBUG;
				break;
			case "info":
				logLevel = this.level.INFO;
				break;
			case "warn":
				logLevel = this.level.WARN;
				break;
			case "error":
				logLevel = this.level.ERROR;
				break;
			default:
				throw new Error(`can't get valid log level. value was: ${config.Log.Level}`);
		}

		this.loggers.forEach((logger) => {
			logger.setLogLevel(logLevel);
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
	__formatMessage(msg, level, exception = null) {
		return msg;
	}


	/**
	 * @private
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 */
	__log(msg, level, exception = null) {
		if (!super.__log(msg, level, exception)) {
			return false;
		}

		this.loggers.forEach((logger) => {
			logger.__log(msg, level, exception);
		});

		return true;
	}
}

module.exports = new LogHandler();
