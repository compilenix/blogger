let config = require("../Config.js");
let minify = require('html-minifier').minify;
let prettifyXml = require('prettify-xml');

class ResponseWrapper {
	constructor(response) {
		this.response = response;
		this.data = "";
		this.push = [];
		this.contentEncoding = "";
		this.responseCode = 500;
		this.lastModified = undefined;
		this.contentType = config.DefaultContentType;
		this.serverVersion = config.ServerVersion;

		if (config.cache) {
			this.expires = config.HeaderExpires;
			// TODO add get/set for this.cacheControl
			this.cacheControl = config.HeaderCacheControl;
		}
	}

	/**
	 * @public
	 * @returns {string}
	 * @memberOf ResponseWrapper
	 */
	getContent() {
		return this.data;
	}

	/**
	 * @public
	 * @returns {number}
	 * @memberOf ResponseWrapper
	 */
	getResponseCode() {
		return this.responseCode;
	}

	/**
	 * @public
	 * @returns {string}
	 * @memberOf ResponseWrapper
	 */
	getResponseStatusMessage() {
		return this.response.statusMessage;
	}

	/**
	 * @public
	 * @returns {string}
	 * @memberOf ResponseWrapper
	 */
	getContentType() {
		return this.contentType;
	}

	/**
	 * @param {string} content
	 * @public
	 * @memberOf ResponseWrapper
	 */
	setContent(content) {
		this.data = content;
	}

	/**
	 * @param {string} encoding
	 * @public
	 * @memberOf ResponseWrapper
	 */
	setContentEncoding(encoding) {
		this.contentEncoding = encoding;
	}

	/**
	 * @public
	 * @param {Date} rfc1123Date
	 * @memberOf ResponseWrapper
	 */
	setLastModified(rfc1123Date) {
		this.lastModified = rfc1123Date;
	}

	/**
	 * @public
	 * @param {string} type
	 * @memberOf ResponseWrapper
	 */
	setContentType(type) {
		this.contentType = type;
	}

	/**
	 * @public
	 * @param {number} code
	 * @memberOf ResponseWrapper
	 */
	setResponseCode(code) {
		this.responseCode = code;
	}

	/**
	 * @public
	 * @param {string} text
	 * @memberOf ResponseWrapper
	 */
	setResponseStatusMessage(text) {
		this.response.statusMessage = text;
	}

	/**
	 * @param {stream.Readable} stream
	 * @public
	 * @memberOf ResponseWrapper
	 */
	sendFileStream(stream) {
		let _this = this;
		this.sendHeader();
		stream.pipe(this.response);

		stream.on("end", () => {
			_this.response.end();
		});
	}

	/**
	 * @param {string} path
	 * @param {string} data
	 * @param {number} httpCode
	 * @param {string} header
	 * @memberOf ResponseWrapper
	 * @public
	 */
	addHttp2PushEntity(path, data, httpCode, header) {
		this.push.push({
			path: path,
			data: data,
			httpCode: httpCode,
			header: header
		});
	}

	/**
	 * @public
	 * @memberOf ResponseWrapper
	 */
	updateLength() {
		if (this.data) {
			if (this.contentEncoding) {
				this.contentLength = Buffer.byteLength(new Buffer(this.data));
			} else {
				this.contentLength = Buffer.byteLength(this.data, "utf8");
			}
		}
	}

	/**
	 * @public
	 * @memberOf ResponseWrapper
	 */
	sendHeader() {
		let headers = {
			"Content-Type": this.contentType,
			"Server": this.serverVersion,
			"Expires": new Date(Date.now() + this.expires).toUTCString()
		};
		if (this.contentLength) {
			headers["Content-Length"] = this.contentLength;
		}
		if (this.expires) {
			headers["Cache-Control"] = "max-age=" + this.expires;
		}
		if (this.lastModified) {
			headers["Last-Modified"] = this.lastModified;
		}
		if (this.contentEncoding) {
			headers["Content-Encoding"] = this.contentEncoding;
		}
		this.response.writeHead(this.responseCode, headers);
		// if (Config.DevMode) {
		// 	console.log({
		// 		"code": this.responseCode,
		// 		"HhttpContentLength": this.data.length,
		// 		"dataLength": this.data.length,
		// 		"type": this.contentType,
		// 		"lastModified": this.lastModified
		// 	});
		// }
	}

	/**
	 * @public
	 * @memberOf ResponseWrapper
	 */
	send() {
		if (config.EnableHttp2 && config.Https.Enabled && this.response.push) {
			this.push.forEach((element) => {
				let currentPush = this.response.push(element.path);
				currentPush.writeHead(element.httpCode, element.header);
				currentPush.end(element.data);
			}, this);
		}

		if (this.contentType.toLowerCase() === "text/html") {
			this.data = minify(this.data, {
				minifyCSS: true,
				minifyJS: true,
				quoteCharacter: `"`,
				removeComments: false,
				removeEmptyAttributes: true,
				useShortDoctype: true,
				collapseWhitespace: true,
				collapseInlineTagWhitespace: false,
				caseSensitive: true,
				decodeEntities: true,
				ignoreCustomComments: [/.*/]
			});
		}

		switch (this.contentType.toLowerCase()) {
			case "text/xml":
			case "text/rss+xml":
			case "application/xml":
			case "application/rss+xml":
				this.data = prettifyXml(this.data, {
					indent: 0
				});
				break;
			default:
				break;
		}

		this.updateLength();
		this.sendHeader();

		if (this.contentEncoding) {
			this.response.end(new Buffer(this.data));
		} else {
			this.response.end(this.data);
		}
	}
}

module.exports = ResponseWrapper;
