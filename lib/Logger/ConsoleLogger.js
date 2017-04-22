const Logger = require("./Logger.js");

var con = require('manakin').local;

class ConsoleLogger extends Logger {
	constructor() {
		super();
		con.setBright();
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

		msg = this.__formatMessage(msg, exception, level);

		switch (level.numeric) {
			case this.level.DEBUG.numeric:
				con.log(msg);
				break;
			case this.level.INFO.numeric:
				con.info(msg);
				break;
			case this.level.WARN.numeric:
				con.warn(msg);
				break;
			case this.level.ERROR.numeric:
				con.error(msg);
				break;
			default:
				break;
		}
	}
}

module.exports = ConsoleLogger;
