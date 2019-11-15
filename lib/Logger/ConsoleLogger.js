const Logger = require('./Logger.js')

const con = require('manakin').local

class ConsoleLogger extends Logger {
  constructor () {
    super()
    con.setBright()
  }

  /**
   * @private
   * @param {string} msg
   * @param {Error|undefined} exception
   * @param {Object} level
   */
  __log (msg, level, exception) {
    if (!super.__log(msg, level, exception)) {
      return false
    }

    msg = this.__formatMessage(msg, level, exception)

    switch (level.numeric) {
      case this.level.DEBUG.numeric:
        con.log(msg)
        break
      case this.level.INFO.numeric:
        con.info(msg)
        break
      case this.level.WARN.numeric:
        con.warn(msg)
        break
      case this.level.ERROR.numeric:
        con.error(msg)
        break
      default:
        break
    }

    return true
  }
}

module.exports = ConsoleLogger
