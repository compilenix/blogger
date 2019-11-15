const config = require('../Config.js')
const minify = require('html-minifier').minify
const prettifyXml = require('prettify-xml')
const log = require('./LogHandler.js')

class ResponseWrapper {
  constructor (response) {
    if (!response) return
    this.response = response
    /** @type {string} */
    this.data = ''
    /** @type {Array} */
    this.push = []
    this.contentEncoding = ''
    this.responseCode = 500
    this.lastModified = undefined
    this.contentType = config.DefaultContentType
    this.serverVersion = config.ServerVersion

    if (config.Cache) {
      this.expires = config.HeaderExpires
      // TODO add get/set for this.cacheControl
      this.cacheControl = config.HandleClientCacheControl
    }
  }

  /**
     * @public
     * @returns {string}
     */
  getContent () {
    return this.data
  }

  /**
     * @public
     * @returns {number}
     */
  getResponseCode () {
    return this.responseCode
  }

  /**
     * @public
     * @returns {string}
     */
  getResponseStatusMessage () {
    return this.response.statusMessage
  }

  /**
     * @public
     * @returns {string}
     */
  getContentType () {
    return this.contentType
  }

  /**
     * @param {string} content
     * @public
     */
  setContent (content) {
    this.data = content
  }

  /**
     * @param {string} encoding
     * @public
     */
  setContentEncoding (encoding) {
    this.contentEncoding = encoding
  }

  /**
     * @public
     * @param {Date} rfc1123Date
     */
  setLastModified (rfc1123Date) {
    this.lastModified = rfc1123Date
  }

  /**
     * @public
     * @returns {string}
     */
  getLastModifiedString () {
    if (this.lastModified === undefined) return ''
    return this.lastModified.toUTCString()
  }

  /**
     * @public
     * @param {string} type
     */
  setContentType (type) {
    this.contentType = type
  }

  /**
     * @public
     * @param {number} code
     */
  setResponseCode (code) {
    this.responseCode = code
  }

  /**
     * @public
     * @param {string} text
     */
  setResponseStatusMessage (text) {
    this.response.statusMessage = text
  }

  /**
     * @param {stream.Readable} stream
     * @public
     */
  sendFileStream (stream) {
    this.sendHeader()
    stream.pipe(this.response)
    stream.on('end', () => {
      this.response.end()
    })
  }

  /**
     * @param {string} path
     * @param {string} data
     * @param {number} httpCode
     * @param {string} header
     * @public
     */
  addHttp2PushEntity (path, data, httpCode, header) {
    this.push.push({
      path: path,
      data: data,
      httpCode: httpCode,
      header: header
    })
  }

  /**
     * @public
     */
  updateLength () {
    if (this.data) {
      if (this.contentEncoding) {
        this.contentLength = Buffer.byteLength(Buffer.from(this.data))
      } else {
        this.contentLength = Buffer.byteLength(this.data, 'utf8')
      }
    }
  }

  /**
     * @public
     */
  sendHeader () {
    log.debug('sending headers')
    const headers = {
      'Content-Type': this.contentType,
      Expires: new Date(Date.now() + this.expires).toUTCString()
    }

    if (config.SendServerVersionInHeader) headers.Server = this.serverVersion

    if (this.contentLength) headers['Content-Length'] = this.contentLength

    if (this.expires) headers['Cache-Control'] = 'max-age=' + this.expires + ', must-revalidate'

    if (this.lastModified) headers['Last-Modified'] = this.getLastModifiedString()

    if (this.contentEncoding) headers['Content-Encoding'] = this.contentEncoding

    this.response.writeHead(this.responseCode, headers)

    // if (Config.DevMode) {
    //   console.log({
    //     code: this.responseCode,
    //     HhttpContentLength: this.data.length,
    //     dataLength: this.data.length,
    //     type: this.contentType,
    //     lastModified: this.lastModified
    //   })
    // }
  }

  /**
     * @private
     */
  __formatOutput () {
    if (this.contentType.toLowerCase() === 'text/html') {
      this.data = minify(this.data, {
        minifyCSS: true,
        minifyJS: true,
        quoteCharacter: '"',
        removeComments: false,
        removeEmptyAttributes: true,
        useShortDoctype: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: false,
        caseSensitive: true,
        decodeEntities: true,
        ignoreCustomComments: [/.*/]
      })
    }

    switch (this.contentType.toLowerCase()) {
      case 'text/xml':
      case 'text/rss+xml':
      case 'application/xml':
      case 'application/rss+xml':
        this.data = prettifyXml(this.data, {
          indent: 0
        })
        break
      default:
        break
    }
  }

  /**
     * @public
     */
  send () {
    log.debug('sending response')
    if (config.EnableHttp2 && config.Https.Enabled && this.response.push) {
      this.push.forEach((element) => {
        const currentPush = this.response.push(element.path)
        currentPush.writeHead(element.httpCode, element.header)
        currentPush.end(element.data)
      }, this)
    }

    if (!config.DevMode) {
      this.__formatOutput()
    }

    this.updateLength()
    this.sendHeader()

    if (this.contentEncoding) {
      this.response.end(Buffer.from(this.data))
    } else {
      this.response.end(this.data)
    }
    log.debug('response send')
  }
}

module.exports = ResponseWrapper
