const crypto = require("crypto");

class NullCache {
    // jshint -W098
    /* eslint-disable no-unused-vars */

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {boolean}
     * @memberOf NullCache
     */
    has(req) {
        return false;
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {any} res
     * @returns {void}
     * @memberOf NullCache
     */
    send(req, res) {
        if (res.send) {
            res.send();
        }
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {Date}
     * @memberOf NullCache
     */
    getLastModified(req) {
        return new Date(0);
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {void}
     * @memberOf NullCache
     */
    del(req) {
        return;
    }

    /**
     * @public
     * @returns {void}
     * @memberOf NullCache
     */
    clear() {
        return;
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {string} content
     * @param {string} mimetype
     * @param {number} httpResponseCode
     * @param {string[]} dependsOnFiles
     * @returns {void}
     * @memberOf NullCache
     */
    add(req, content, mimetype, httpResponseCode, dependsOnFiles) {
        return;
    }

    /**
     * @private
     * @param {http.IncomingMessage} req
     * @returns {string}
     * @memberOf NullCache
     */
    _hash(req) {
        if (req.url === undefined) throw new Error(`req.url can't be empty`);
        return crypto.createHash("sha1").update(req.url).digest("hex");
    }
}

module.exports = NullCache;
