const zlib = require("zlib");

const NullCache = require("./NullCache.js");
const ResponseWrapper = require("../ResponseWrapper.js");

const log = require("../LogHandler.js");

class MemCache extends NullCache {
    constructor() {
        super();
        this.cache = {};
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {boolean}
     * @memberOf MemCache
     */
    has(req) {
        return !!(
            this.cache[this._hash(req)] &&
            this.cache[this._hash(req)].response_code
        );
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {ResponseWrapper} res
     * @returns {void}
     * @memberOf MemCache
     */
    send(req, res) {
        if (!this.has(req)) return;
        const data = this.cache[this._hash(req)];

        super._handleRequestAcceptEncoding(req, res, data);

        res.setResponseCode(data.response_code);
        res.setContentType(data.mime_type);
        res.setLastModified(this.getLastModified(req));
        res.send();
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {Date}
     * @memberOf MemCache
     */
    getLastModified(req) {
        if (this.has(req)) {
            return new Date(this.cache[this._hash(req)].time);
        } else {
            return new Date(0);
        }
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {void}
     * @memberOf MemCache
     */
    del(req) {
        if (this.has(req)) {
            log.debug(`Remove cache file: ${this._hash(req)}`);
            this.cache[this._hash(req)] = undefined;
        }
    }

    /**
     * @public
     * @returns {void}
     * @memberOf MemCache
     */
    clear() {
        this.cache = {};
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {string} content
     * @param {string} mimetype
     * @param {number} httpResponseCode
     * @returns {void}
     * @memberOf MemCache
     */
    add(req, content, mimetype, httpResponseCode) {
        const data = {
            mime_type: mimetype,
            response_code: httpResponseCode,
            time: new Date(),
            content: content,
            content_gzip: zlib.gzipSync(new Buffer(content, "utf8"), {
                level: zlib.Z_BEST_COMPRESSION,
                memLevel: 9,
                flush: zlib.Z_NO_FLUSH
            }),
            content_deflate: zlib.deflateSync(content, {
                level: zlib.Z_BEST_COMPRESSION,
                memLevel: 9,
                flush: zlib.Z_NO_FLUSH
            })
        };

        log.debug(`Add mem cache ${this._hash(req)}`);
        this.cache[this._hash(req)] = data;
    }

    /**
     * @private
     * @param {http.IncomingMessage} req
     * @returns {string}
     * @memberOf MemCache
     */
    _hash(req) {
        return super._hash(req);
    }
}

module.exports = MemCache;
