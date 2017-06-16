class Logger {
	constructor() {
		this.level = {
			ERROR: {
				numeric: 3,
				descr: "error"
			},
			WARN: {
				numeric: 2,
				descr: "warn"
			},
			INFO: {
				numeric: 1,
				descr: "info"
			},
			DEBUG: {
				numeric: 0,
				descr: "debug"
			}
		};

		this.logLevel = this.level.ERROR;
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 */
	debug(msg, exception = null) {
		this.__log(msg, this.level.DEBUG, exception);
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 */
	info(msg, exception = null) {
		this.__log(msg, this.level.INFO, exception);
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 */
	warn(msg, exception = null) {
		this.__log(msg, this.level.WARN, exception);
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 */
	error(msg, exception = null) {
		this.__log(msg, this.level.ERROR, exception);
	}

	/**
	 * @param {Object} level
	 */
	setLogLevel(level) {
		// TODO add check
		this.logLevel = level;
	}

	/**
	 * @protected
	 * @virtual
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 * @returns {string}
	 */
	__formatMessage(msg, level, exception = null) {
		let str = `[${new Date()}] ${level.descr}: ${msg}`;

		if (exception) {
			str += "\n" + `error message: ${exception.message}` + "\n" + `error stack: ${exception.stack}`;
		}

		return str;
	}

	/**
	 * @protected
	 * @virtual
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 */
	__log(msg, level, exception = null) {
		if (!level || isNaN(level.numeric)) {
			return false;
		}

		if (level.numeric < this.logLevel.numeric) {
			return false;
		}

		return true;
	}
}

module.exports = Logger;
