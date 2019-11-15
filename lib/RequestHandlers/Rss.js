const Helper = require('../Helper.js')
const config = require('../../Config.js')

class Rss {
  /**
   * Creates an instance of Rss.
   * @param {Server} server
   * @memberOf Rss
   */
  constructor (server) {
    this.server = server
    this.response = {
      type: 'error',
      code: 404,
      content: 'nothing found!',
      mimetype: 'text/plain'
    }
  }

  /**
   * @public
   * @param {http.ClientRequest} request
   * @returns {Object}
   * @memberOf Rss
   */
  processRequest (request) {
    switch (request.method) {
      case 'GET':
        return this._processRequest(request)
      default:
        this.response.code = 501
        break
    }

    return this.response
  }

  _processRequest () {
    const posts = Helper.getAllPostIds(true)
    const deps = []
    let counter = 0
    let data = ''
    let dataToSend = this.generateRssHeader()

    for (let i = 0; i < posts.length; i++) {
      if (counter < config.rss.CountPosts) {
        data = Helper.getPost(posts[i])
        if (data !== '') {
          dataToSend += `
            <item>
              <title>${data.title}</title>
              <author>${config.authorMail} (${config.author})</author>
              <link>${config.Link}${config.root}post/${posts[i]}</link>
              <guid>${config.Link}${config.root}post/${posts[i]}</guid>
              <pubDate>${new Date(parseInt(posts[i], 16) * 1000).toUTCString()}</pubDate>
              <description><![CDATA[${data.contents}]]></description>
            </item>`

          deps.push(config.post.DirectoryPosts + Helper.GetFsDelimiter() + posts[i] + '.json')
          counter++
        }
      }
    }

    dataToSend += '</channel></rss>'

    return {
      type: 'content',
      code: 200,
      content: dataToSend,
      mimetype: 'text/xml'
    }
  }

  generateRssHeader () {
    let skipHoursString = ''
    for (let i = 0; i < config.rss.skipHours.length; i++) {
      skipHoursString += `<hour>${config.rss.skipHours[i]}</hour>`
    }

    let data = `<?xml version="1.0" encoding="${config.rss.Encoding}" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>${config.rss.Title}</title>
          <link>${config.Link + config.root}</link>
          <atom:link href="${config.Link}/rss.xml" rel="self" type="application/rss+xml" />
          <description>${config.rss.Description}</description>
          <generator>${config.ServerVersion}</generator>
          <ttl>${config.rss.ttl}</ttl>`
    if (skipHoursString !== '') {
      data += `<skipHours>${skipHoursString}</skipHours>`
    }

    data += `  <webMaster>${config.rss.webMasterMail} (${config.rss.webMaster})</webMaster>
          <language>${config.language}</language>`

    return data
  }
}

module.exports = Rss
