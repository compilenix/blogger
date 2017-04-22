const Logger = require("./Logger.js");

class ConsoleLogger extends Logger {
	constructor() {
		super();
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

		// eslint-disable-next-line no-console
		console.log(this.__formatMessage(msg, exception, level));
	}
}

module.exports = ConsoleLogger;
