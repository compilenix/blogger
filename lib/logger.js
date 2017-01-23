var instance;

class Logger {
	constructor() {
		this.level = {};
		this.level.ERROR = {
			numeric: 3,
			descr: "error"
		};
		this.level.WARN = {
			numeric: 2,
			descr: "warn"
		};
		this.level.INFO = {
			numeric: 1,
			descr: "info"
		};
		this.level.DEBUG = {
			numeric: 0,
			descr: "debug"
		};

		this.logLevel = this.level.ERROR;
	}

	debug(msg, exception) {
		this.__log(msg, exception, this.level.DEBUG);
	}

	info(msg, exception) {
		this.__log(msg, exception, this.level.INFO);
	}

	warn(msg, exception) {
		this.__log(msg, exception, this.level.WARN);
	}

	error(msg, exception) {
		this.__log(msg, exception, this.level.ERROR);
	}

	setLogLevel(level) {
		//TODO: add check
		this.logLevel = level;
	}

	__formatMessage(msg, exception, level) {
		var str = level.descr + ": " + msg;

		if (exception) {
			str += "\nerror message: " + exception.message + "\nerror stack: " + exception.stack;
		}

		return str;
	}

	__log(msg, exception, level) {
		if (level.numeric >= this.logLevel.numeric) {
			console.log(this.__formatMessage(msg, exception, level));
		}
	}
}

function getLogger() {
	if (!instance) {
		instance = new Logger();
	}

	return instance;
}

module.exports = getLogger();
