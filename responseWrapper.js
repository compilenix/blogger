function _responseWrapper(response) {
	this.response = response;
	this.data = '';
	this.responseCode = 404;
	this.contentLength = null;
	this.contentType = _Config.DefaultContentType || "text/html";
	this.serverVersion = _Config.ServerVersion || "node.js/" + process.version;
	if (_cache) {
		this.expires = _Config.HeaderExpires || 60000 * 10; // 60 Minutes
		this.cacheControl = _Config.HeaderCacheControl || "public";
	}
	this.lastModified = new Date(Date.now()).toUTCString();
}

_responseWrapper.prototype.setContent = function (content) {
	this.data = content;
	this.updateLength();
}

_responseWrapper.prototype.sendFileStream = function (fileStream) {
	var t = this;
	this.sendHeader();
	fileStream.pipe(this.response);

	fileStream.on('end', function() {
	    t.response.end();
	});
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
	if (this.data) {
		this.contentLength = Buffer.byteLength(this.data, 'utf8');
	}
}

_responseWrapper.prototype.sendHeader = function () {
	var data = {"Content-Type": this.contentType, "Server": this.serverVersion, "Expires": new Date(Date.now() + this.expires).toUTCString()};
	if (this.contentLength) data["Content-Length"] = this.contentLength;
	if (this.expires) data["Cache-Control"] = "max-age=" + this.expires;
	if (this.lastModified) data["Last-Modified"] = this.lastModified;
	this.response.writeHead(this.responseCode, data);
}

_responseWrapper.prototype.send = function () {
	this.sendHeader();
	this.response.end(this.data);
}

exports.responseWrapper = _responseWrapper;
