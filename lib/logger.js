/** @type {Logger} */
let instance;

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
	 * @memberOf Logger
	 */
	debug(msg, exception) {
		this.__log(msg, exception, this.level.DEBUG);
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 * @memberOf Logger
	 */
	info(msg, exception) {
		this.__log(msg, exception, this.level.INFO);
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 * @memberOf Logger
	 */
	warn(msg, exception) {
		this.__log(msg, exception, this.level.WARN);
	}

	/**
	 * @param {string} msg
	 * @param {Error} exception
	 * @memberOf Logger
	 */
	error(msg, exception) {
		this.__log(msg, exception, this.level.ERROR);
	}

	/**
	 * @param {Object} level
	 * @memberOf Logger
	 */
	setLogLevel(level) {
		// TODO add check
		this.logLevel = level;
	}

	/**
	 * @private
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 * @returns {string}
	 * @memberOf Logger
	 */
	__formatMessage(msg, exception, level) {
		let str = level.descr + ": " + msg;

		if (exception) {
			str += "\nerror message: " + exception.message + "\nerror stack: " + exception.stack;
		}

		return str;
	}

	/**
	 * @private
	 * @param {string} msg
	 * @param {Error} exception
	 * @param {Object} level
	 * @memberOf Logger
	 */
	__log(msg, exception, level) {
		if (level.numeric >= this.logLevel.numeric) {
			// eslint-disable-next-line no-console
			console.log(this.__formatMessage(msg, exception, level));
		}
	}
}


/**
 * @returns {Logger}
 */
function getLogger() {
	if (!instance) {
		instance = new Logger();
	}

	return instance;
}

module.exports = getLogger();
