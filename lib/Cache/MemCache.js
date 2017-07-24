const zlib = require("zlib");

const NullCache = require("./NullCache.js");

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
     * @param {any} res
     * @returns {void}
     * @memberOf MemCache
     */
    send(req, res) {
        if (!this.has(req)) return;
        const data = this.cache[this._hash(req)];

        if (req.headers["accept-encoding"]) {
            if (req.headers["accept-encoding"].match(/\bgzip\b/)) {
                res.setContentEncoding("gzip");
                res.setContent(data.content_gzip);
            } else if (req.headers["accept-encoding"].match(/\bdeflate\b/)) {
                res.setContentEncoding("deflate");
                res.setContent(data.content_deflate);
            } else {
                res.setContent(data.content);
            }
        } else {
            res.setContent(data.content);
        }

        res.setResponseCode(data.response_code);
        res.setContentType(data.mime_type);
        res.setLastModified(this.getLastModified(req).toUTCString());
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
     * @param {string[]} dependsOnFiles
     * @returns {void}
     * @memberOf MemCache
     */
    add(req, content, mimetype, httpResponseCode, dependsOnFiles) {
        const data = {
            mime_type: mimetype,
            response_code: httpResponseCode,
            time: new Date(),
            dependencies: dependsOnFiles,
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
