const zlib = require("zlib");
const fs = require("fs");

const NullCache = require("./NullCache.js");
const Helper = require("../Helper.js");
const ResponseWrapper = require("../ResponseWrapper.js");

const log = require("../LogHandler.js");
const config = require("../../Config.js");

class FsCache extends NullCache {
    constructor() {
        super();
        this.DirectoryCache = config.DirectoryCache;
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {boolean}
     * @memberOf FsCache
     */
    has(req) {
        return fs.existsSync(this._path(req));
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {ResponseWrapper} res
     * @returns {void}
     * @memberOf FsCache
     */
    send(req, res) {
        if (!this.has(req)) return;
        const data = JSON.parse(fs.readFileSync(this._path(req), "utf8"));

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
     * @memberOf FsCache
     */
    getLastModified(req) {
        if (this.has(req)) {
            return new Date(fs.statSync(this._path(req)).mtime);
        } else {
            return new Date(0);
        }
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @returns {void}
     * @memberOf FsCache
     */
    del(req) {
        if (this.has(req)) {
            const file = this._path(req);
            log.debug(`Remove cache file: ${file}`);
            fs.unlinkSync(file);
        }
    }

    /**
     * @public
     * @returns {void}
     * @memberOf FsCache
     */
    clear() {
        this._checkOrCreateDirectory();
        const cacheFileList = fs.readdirSync(this.DirectoryCache);
        for (let i = 0; i < cacheFileList.length; i++) {
            log.debug("Remove cache file: " + this.DirectoryCache + Helper.GetFsDelimiter() + cacheFileList[i]);
            fs.unlinkSync(this.DirectoryCache + Helper.GetFsDelimiter() + cacheFileList[i]);
        }
    }

    /**
     * @public
     * @param {http.IncomingMessage} req
     * @param {string} content
     * @param {string} mimetype
     * @param {number} httpResponseCode
     * @returns {void}
     * @memberOf FsCache
     */
    add(req, content, mimetype, httpResponseCode) {
        const data = JSON.stringify({
            mime_type: mimetype,
            response_code: httpResponseCode,
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
        });

        log.debug(`Add cache file: ${this._path(req)}`);
        fs.writeFileSync(this._path(req), data);
    }

    /**
     * @private
     * @param {http.IncomingMessage} req
     * @returns {string}
     * @memberOf FsCache
     */
    _hash(req) {
        return super._hash(req);
    }

    /**
     * @private
     * @param {http.IncomingMessage} req
     * @returns {string}
     * @memberOf FsCache
     */
    _path(req) {
        this._checkOrCreateDirectory();
        return this.DirectoryCache + Helper.GetFsDelimiter() + this._hash(req) + ".json";
    }

    /**
     * @private
     * @description check for existance of the cache directory, and create it if not existing
     * @returns {void}
     * @memberOf FsCache
     */
    _checkOrCreateDirectory() {
        if (!fs.existsSync(this.DirectoryCache)) {
            log.info("creating output-cache directory");
            fs.mkdirSync(this.DirectoryCache);
        }
    }
}

module.exports = FsCache;
