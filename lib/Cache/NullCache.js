let crypto = require("crypto");

class NullCache {
	// jshint -W098
	/* eslint-disable no-unused-vars */

	/**
	 * @param {any} req
	 * @returns {boolean}
	 * @memberOf NullCache
	 */
	has(req) {
		return false;
	}

	/**
	 * @param {any} req
	 * @param {any} res
	 * @memberOf NullCache
	 */
	send(req, res) {
		res.send();
	}

	/**
	 * @param {any} req
	 * @returns {Date}
	 * @memberOf NullCache
	 */
	getLastModified(req) {
		return 0;
	}

	/**
	 * @param {any} req
	 * @returns {null}
	 * @memberOf NullCache
	 */
	del(req) {
		return null;
	}

	/**
	 * @returns {null}
	 * @memberOf NullCache
	 */
	clear() {
		return null;
	}

	/**
	 * @param {any} req
	 * @param {string} content
	 * @param {string} mimetype
	 * @param {number} httpResponseCode
	 * @param {string[]} dependsOnFiles
	 * @returns {null}
	 * @memberOf NullCache
	 */
	add(req, content, mimetype, httpResponseCode, dependsOnFiles) {
		return null;
	}

	/**
	 * @private
	 * @param {any} req
	 * @returns {string}
	 * @memberOf NullCache
	 */
	_hash(req) {
		return crypto.createHash("sha1").update(req.url).digest("hex");
	}
}

module.exports = NullCache;
