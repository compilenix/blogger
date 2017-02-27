const zlib = require("zlib");
const fs = require("fs");

const NullCache = require("./NullCache.js");

const logger = require("./../logger.js");
const config = require("../../Config.js");

class FsCache extends NullCache {
	constructor() {
		super();

		this.DirectoryCache = config.DirectoryCache || "cache";

		if (!fs.existsSync(this.DirectoryCache)) {
			fs.mkdirSync(this.DirectoryCache);
		}
	}

	has(req) {
		return fs.existsSync(this._path(req));
	}

	send(req, res) {
		if (this.has(req)) {
			const data = JSON.parse(fs.readFileSync(this._path(req), "utf8"));

			if (req.headers["accept-encoding"]) {
				if (req.headers["accept-encoding"].match(/\bgzip\b/)) {
					res.setContentEncoding("gzip");
					res.setContent(data.content_gzip.data);
				} else if (req.headers["accept-encoding"].match(/\bdeflate\b/)) {
					res.setContentEncoding("deflate");
					res.setContent(data.content_deflate.data);
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
			return new Date(fs.statSync(this._path(req)).mtime).toUTCString();
		} else {
			return false;
		}
	}

	del(req) {
		if (this.has(req)) {
			const file = this._path(req);
			logger.info("Remove cache file: " + file);
			fs.unlinkSync(file);
		}
	}

	clear() {
		const cacheFileList = fs.readdirSync(this.DirectoryCache);
		for (let i = 0; i < cacheFileList.length; i++) {
			logger.info("Remove cache file: " + this.DirectoryCache + global.Helper.GetFsDelimiter() + cacheFileList[i]);
			fs.unlinkSync(this.DirectoryCache + global.Helper.GetFsDelimiter() + cacheFileList[i]);
		}
	}

	add(req, cont, mime, code) {
		const data = JSON.stringify({
			mime_type: mime,
			response_code: code,
			content: cont,
			content_gzip: zlib.gzipSync(cont, { level: zlib.Z_BEST_COMPRESSION, memLevel: 9, flush: zlib.Z_NO_FLUSH }),
			content_deflate: zlib.deflateSync(cont, { level: zlib.Z_BEST_COMPRESSION, memLevel: 9, flush: zlib.Z_NO_FLUSH })
		});

		logger.info("Add cache file: " + this._path(req));
		fs.writeFileSync(this._path(req), data);
	}

	_hash(req) {
		return super._hash(req);
	}

	_path(req) {
		return this.DirectoryCache + global.Helper.GetFsDelimiter() + this._hash(req) + ".json";
	}
}

module.exports = FsCache;
