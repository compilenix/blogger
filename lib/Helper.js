const path = require('path')
const fs = require('fs')

const Renderer = require('./Renderer.js')

const config = require('../Config.js')

class Helper {
  /**
   * @public
   * @static
   * @param {boolean} reverseOrder
   * @param {boolean} [includeUnpublished = false]
   * @returns {string[] | any[]} string[] if includeUnpublished = false else Object[] => { id, isPublished }
   * @memberOf Helper
   */
  static getAllPostIds (reverseOrder, includeUnpublished = false) {
    const data = []
    let posts

    posts = fs.readdirSync(config.post.DirectoryPosts)

    if (reverseOrder) {
      posts = posts.reverse()
    }

    for (let i = 0; i < posts.length; i++) {
      const id = posts[i].replace('.json', '')

      if (!this.getPostIfIsValid(id)) {
        continue
      }

      const isPublished = fs.existsSync(config.post.DirectoryPosts + this.GetFsDelimiter() + posts[i] + '.asc')
      if (includeUnpublished) {
        data.push({
          id: id,
          isPublished: isPublished
        })
        continue
      }

      if (isPublished) {
        data.push(id)
      }
    }

    return data
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {string}
   * @memberOf Helper
   */
  static getTitle (id) {
    return this.getPost(id).title
  }

  /**
   * @public
   * @static
   * @param {boolean} reverseOrder
   * @param {boolean} [includeUnpublished = false]
   * @returns
   * @memberOf Helper
   */
  static getTitles (reverseOrder, includeUnpublished = false) {
    const data = []
    const list = this.getAllPostIds(reverseOrder, includeUnpublished)

    for (let i = 0; i < list.length; i++) {
      if (includeUnpublished) {
        data.push(this.getTitle(list[i].id))
      } else {
        data.push(this.getTitle(list[i]))
      }
    }

    return data
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @param {string} content
   * @param {string} title
   * @memberOf Helper
   */
  static writePost (id, content, title) {
    const data = JSON.stringify({
      title: title,
      contents: content
    })

    fs.writeFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`, data, 'utf8')
    fs.writeFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`, '', 'utf8')
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {boolean} true if the post existed and has been removed
   * @memberOf Helper
   */
  static removePost (id) {
    if (this.postExists(id)) {
      fs.unlinkSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`)
      fs.unlinkSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`)
      return true
    }

    return false
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {boolean | null} true if the post has been published; false if it has been depublished; null if the post does not exists
   * @memberOf Helper
   */
  static TogglePublish (id) {
    if (!this.postExists(id)) {
      return null
    }

    if (this.IsPostPublished(id)) {
      fs.unlinkSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`)
      return false
    }

    fs.writeFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`, '', 'utf8')
    return true
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {boolean | null} true if the post has been published; false if it has been depublished; null if the post does not exists
   * @memberOf Helper
   */
  static IsPostPublished (id) {
    if (!this.postExists(id)) {
      return null
    }

    if (fs.existsSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json.asc`)) {
      return true
    }

    return false
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {boolean}
   * @memberOf Helper
   */
  static postExists (id) {
    if (!fs.existsSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`)) {
      return false
    }

    try {
      fs.accessSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`, fs.constants.R_OK)
    } catch (error) {
      return false
    }

    return true
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {boolean|any} false if invalid or does not exists else return post object
   * @memberOf Helper
   */
  static getPostIfIsValid (id) {
    let data

    if (!this.postExists(id)) {
      return false
    }

    if ((data = fs.readFileSync(`${config.post.DirectoryPosts}${this.GetFsDelimiter()}${id}.json`, 'utf8')).length < 26) {
      return false
    }

    try {
      data = JSON.parse(data)
    } catch (error) {
      return false
    }

    if (data.title && data.contents) {
      return data
    }

    return false
  }

  /**
   * @public
   * @static
   * @param {string} id
   * @returns {null|any}
   * @memberOf Helper
   */
  static getPost (id) {
    let data

    if ((data = this.getPostIfIsValid(id))) {
      return data
    } else {
      return null
    }
  }

  /**
   * @public
   * @static
   * @param {string} content
   * @param {string} title
   * @returns {string}
   * @memberOf Helper
   */
  static getPage (content, title) {
    const renderer = new Renderer()
    renderer.fields.title += ` - ${title}`
    const header = renderer.render(fs.readFileSync('templates' + this.GetFsDelimiter() + config.post.FileHeader, 'utf8'))
    const footer = renderer.render(fs.readFileSync('templates' + this.GetFsDelimiter() + config.post.FileFooter, 'utf8'))
    return header + content + footer
  }

  /**
   * @public
   * @static
   * @param {string} find
   * @param {string} replace
   * @param {string} str
   * @returns {string}
   * @memberOf Helper
   */
  static replaceAll (find, replace, str) {
    return str.replace(new RegExp(find.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace)
  }

  /**
   * @public
   * @static
   * @returns {string}
   * @memberOf Helper
   */
  static GetFsDelimiter () {
    return path.sep
  }
}

module.exports = Helper
