const ResponseCodeMessage = require('../ResponseCodeMessage.js')

class Code {
  /**
   * Creates an instance of Code.
   * @param {Server} server
   * @memberOf Code
   */
  constructor (server) {
    this.server = server
    this.response = {
      type: 'error',
      code: 500,
      content: '',
      mimetype: 'text/plain'
    }
    this.responseCodeMessage = new ResponseCodeMessage()
  }

  /**
   * @public
   * @param {http.ClientRequest} request
   * @returns {Object}
   * @memberOf Code
   */
  processRequest (request) {
    const query = request.url.split('/').pop()

    switch (request.method) {
      case 'GET':
        if (query && query.match(/^[0-9]{3}$/)) {
          const number = Number.parseInt(query)
          if (number) {
            this.responseCodeMessage.code = number
            this.responseCodeMessage.message = this.responseCodeMessage.getMessageFromCode(number)
            this.response.code = number
            this.response.content = this.responseCodeMessage.generateContent()
            this.response.mimetype = 'text/html'
          }
        } else {
          this.response.code = 404
        }

        break
      default:
        this.response.code = 501
        break
    }

    return this.response
  }
}

module.exports = Code
