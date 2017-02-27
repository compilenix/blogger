const zlib = require("zlib");

const NullCache = require("./NullCache.js");

const logger = require("./../logger.js");

class MemCache extends NullCache {
	constructor() {
		super();
		this.cache = {};
	}

	has(req) {
		return typeof this.cache[this._hash(req)] !== undefined;
	}

	send(req, res) {
		if (this.has(req)) {
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
			res.setLastModified(this.getLastModified(req));
			res.send();
		}
	}

	getLastModified(req) {
		if (this.has(req)) {
			return (this.cache[this._hash(req)].time).toUTCString();
		} else {
			return false;
		}
	}

	del(req) {
		if (this.has(req)) {
			logger.info("Remove cache file: " + this._hash(req));
			this.cache[this._hash(req)] = undefined;
		}
	}

	clear() {
		this.cache = {};
	}

	add(req, cont, mime, code, dependsOn) {
		const data = {
			mime_type: mime,
			response_code: code,
			time: new Date(),
			dependencies: dependsOn,
			content: cont,
			content_gzip: zlib.gzipSync(cont, { level: zlib.Z_BEST_COMPRESSION, memLevel: 9, flush: zlib.Z_NO_FLUSH }),
			content_deflate: zlib.deflateSync(cont, { level: zlib.Z_BEST_COMPRESSION, memLevel: 9, flush: zlib.Z_NO_FLUSH })
		};

		logger.info("Add mem cache " + this._hash(req));
		this.cache[this._hash(req)] = data;
	}

	_hash(req) {
		return super._hash(req);
	}
}

module.exports = MemCache;
