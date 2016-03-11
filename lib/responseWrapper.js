"use strict";

function _responseWrapper(response) {
    this.response = response;
    this.data = "";
    this.contentEncoding = "";
    this.responseCode = 500;
    this.contentLength = null;
    this.contentType = Config.DefaultContentType || "text/html";
    this.serverVersion = Config.ServerVersion || "node.js/" + process.version;
    if (Cache) {
        this.expires = Config.HeaderExpires || 60000 * 10; // 60 Minutes
        // TODO add get/set for this.cacheControl
        this.cacheControl = Config.HeaderCacheControl || "public";
    }
    this.lastModified = new Date(Date.now()).toUTCString();
}

_responseWrapper.prototype.setContent = function (content) {
    this.data = content;
    this.updateLength();
}

_responseWrapper.prototype.setContentEncoding = function (encoding) {
    this.contentEncoding = encoding;
}

_responseWrapper.prototype.sendFileStream = function (fileStream) {
    var t = this;
    this.sendHeader();
    fileStream.pipe(this.response);

    fileStream.on("end", function() {
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
        if (this.contentEncoding) {
            this.contentLength = Buffer.byteLength(new Buffer(this.data));
        } else {
            this.contentLength = Buffer.byteLength(this.data, "utf8");
        }
    }
}

_responseWrapper.prototype.sendHeader = function () {
    var headers = {"Content-Type": this.contentType, "Server": this.serverVersion, "Expires": new Date(Date.now() + this.expires).toUTCString()};
    if (this.contentLength) headers["Content-Length"] = this.contentLength;
    if (this.expires) headers["Cache-Control"] = "max-age=" + this.expires;
    if (this.lastModified) headers["Last-Modified"] = this.lastModified;
    if (this.contentEncoding) headers["Content-Encoding"] = this.contentEncoding;
    this.response.writeHead(this.responseCode, headers);
}

_responseWrapper.prototype.send = function () {
    this.sendHeader();
    if (this.contentEncoding) {
        this.response.end(new Buffer(this.data));
    } else {
        this.response.end(this.data);
    }
}

exports.ResponseWrapper = _responseWrapper;
