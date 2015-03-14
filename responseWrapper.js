function _responseWrapper(response) {
	this.response = response;
	this.data = '';
	this.responseCode = 404;
	this.contentLength = 0;
	this.contentType = _Config.DefaultContentType || "text/html";
	this.serverVersion = _Config.ServerVersion || "node.js/" + process.version;
	this.expires = _Config.HeaderExpires || 60000 * 10; // 10 Minutes
	this.cacheControl = _Config.HeaderCacheControl || "public";
	this.lastModified = new Date(Date.now()).toUTCString();
}

_responseWrapper.prototype.setContent = function (content) {
	this.data = content;
	this.updateLength();
}

_responseWrapper.prototype.getContent = function () {
	return this.data;
}

_responseWrapper.prototype.getResponseCode = function () {
	return this.responseCode;
}

_responseWrapper.prototype.getContentType = function () {
	return this.contentType;
}

_responseWrapper.prototype.setLastModified = function (rfc1123Date) {
	this.lastModified = rfc1123Date;
}

_responseWrapper.prototype.setContentType = function (type) {
	this.contentType = type;
}

_responseWrapper.prototype.setResponseCode = function (code) {
	this.responseCode = code;
}

_responseWrapper.prototype.updateLength = function () {
	this.contentLength = Buffer.byteLength(this.data, 'utf8');
}

_responseWrapper.prototype.send = function () {
	this.response.writeHead(this.responseCode, {
		"Content-Type": this.contentType,
		"Content-Length": this.contentLength,
		"Server": this.serverVersion,
		"Cache-Control": "max-age=" + this.expires,
		"Last-Modified": this.lastModified,
		"Expires": new Date(Date.now() + this.expires).toUTCString()
	});
	this.response.end(this.data);
}

exports.responseWrapper = _responseWrapper;
