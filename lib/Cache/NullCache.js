const crypto = require('crypto')

const ResponseWrapper = require('../ResponseWrapper.js')

class NullCache {
  // jshint -W098
  /* eslint-disable no-unused-vars */

  /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {boolean}
     * @memberOf NullCache
     */
  has (req) {
    return false
  }

  /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {any} res
     * @returns {void}
     * @memberOf NullCache
     */
  send (req, res) {
    if (res.send) {
      res.send()
    }
  }

  /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {Date}
     * @memberOf NullCache
     */
  getLastModified (req) {
    return new Date(0)
  }

  /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {string}
     */
  getLastModifiedString (req) {
    return this.getLastModified(req).toUTCString()
  }

  /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {void}
     * @memberOf NullCache
     */
  del (req) {

  }

  /**
     * @public
     * @returns {void}
     * @memberOf NullCache
     */
  clear () {

  }

  /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {string} content
     * @param {string} mimetype
     * @param {number} httpResponseCode
     * @returns {void}
     * @memberOf NullCache
     */
  add (req, content, mimetype, httpResponseCode) {

  }

  /**
     * @private
     * @param {http.IncomingMessage} req
     * @returns {string}
     * @memberOf NullCache
     */
  _hash (req) {
    if (req.url === undefined) throw new Error('req.url can\'t be empty')
    return crypto.createHash('sha1').update(req.url).digest('hex')
  }

  /**
     * @protected
     * @param {http.IncomingMessage} req
     * @param {ResponseWrapper} res
     * @param {any} data
     * @returns {void}
     * @memberOf NullCache
     */
  _handleRequestAcceptEncoding (req, res, data) {
    if (req.headers === undefined || req.headers['accept-encoding'] === undefined) return

    /**
         * @private
         * @param {string} header
         */
    function _setContentAndEncoding (header) {
      if (header.match(/\bgzip\b/)) {
        res.setContentEncoding('gzip')
        res.setContent(data.content_gzip)
      } else if (header.match(/\bdeflate\b/)) {
        res.setContentEncoding('deflate')
        res.setContent(data.content_deflate)
      } else {
        res.setContent(data.content)
      }
    }

    const headers = req.headers['accept-encoding']
    if (Array.isArray(headers) && headers.length > 0 && typeof headers[0] === 'string') {
      _setContentAndEncoding(headers[0])
    } else if (typeof headers === 'string') {
      _setContentAndEncoding(headers)
    } else {
      res.setContent(data.content)
    }

    req.headers['accept-encoding'] = headers
  }
}

module.exports = NullCache
