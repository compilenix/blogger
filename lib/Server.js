const http = require("http");
const https = require("https");
const http2 = require("http2");
const domain = require("domain");
const url = require("url");
const fs = require("fs");
const querystring = require("querystring");

const ResponseWrapper = require("./ResponseWrapper.js");
const ResponseCodeMessage = require("./ResponseCodeMessage.js");
const Router = require("./Router.js");
const NullCache = require("./Cache/NullCache.js");
const Helper = require("./Helper.js");
const RequestHandler = require("./RequestHandler.js");

const config = require("../Config.js");
const log = require("./LogHandler.js");

class Server {
	constructor() {
		this.cache = new NullCache();
		this.router = new Router(null);
		this.port = config.server.port;
		this.onErrRes = new ResponseWrapper(null);
		this.httpServerToUse = "http";
		this.requestHandlersMappings = [];
		this.requestHandler = new RequestHandler(this);

		/** @type {https.ServerOptions} */
		this.httpsOptions = {
			key: config.Https.Key,
			cert: config.Https.Cert
		};
	}

	/**
	 * @public
	 * @memberOf Server
	 */
	start() {
		if (config.EnableHttp2 && config.Https.Enabled) {
			log.info("Start server with https AND h2 enabled");
			this.httpServerToUse = "http2";
		} else if (config.Https.Enabled) {
			log.info("Start server with https enabled");
			this.httpServerToUse = "https";
		} else {
			log.info("Start server with http");
			this.httpServerToUse = "http";
		}

		if (config.DevMode) {
			log.info("Starting Server on port: " + this.port);
			let _this = this;

			switch (this.httpServerToUse) {
				case "http":
					http.createServer((request, response) => {
						_this._onRequest(_this, request, response);
					}).listen(this.port);
					break;
				case "https":
					https.createServer(this.httpsOptions, (request, response) => {
						_this._onRequest(_this, request, response);
					}).listen(this.port);
					break;
				case "http2":
					http2.createServer(this.httpsOptions, (request, response) => {
						_this._onRequest(_this, request, response);
					}).listen(this.port);
					break;
			}
		} else {
			const currentDomain = domain.create();
			let _this = this;
			currentDomain.on("error", (error) => {
				_this._onError(_this, error);
			});
			currentDomain.run(() => {
				_this._onDomainRun(_this);
			});
		}

		log.info("Init done, waiting for clients/requests...");
	}

	/**
	 * @public
	 * @param {Array} handlerList
	 * @memberOf Server
	 */
	setRequestHandlers(handlerList) {
		this.requestHandlersMappings = handlerList;
		this.router = new Router(this.requestHandlersMappings);
	}

	/**
	 * @public
	 * @param {NullCache} cacheModule
	 * @memberOf Server
	 */
	setCacheModule(cacheModule) {
		this.cache = cacheModule;
	}

	/**
	 * @private
	 * @param {Server} server
	 * @param {http.IncomingMessage} request
	 * @param {http.ServerResponse} response
	 * @memberOf Server
	 */
	_onRequest(server, request, response) {
		const res = new ResponseWrapper(response);

		if (!config.DevMode) {
			this.onErrRes = res;
		}

		server._processRequest(server, request, res);
	}

	_onDomainRun() {
		log.info("Starting Server on port: " + this.port);
		let _this = this;

		switch (this.httpServerToUse) {
			case "http":
				http.createServer((request, response) => {
					_this._onRequest(_this, request, response);
				}).listen(this.port);
				break;
			case "https":
				https.createServer(this.httpsOptions, (request, response) => {
					_this._onRequest(_this, request, response);
				}).listen(this.port);
				break;
			case "http2":
				http2.createServer(this.httpsOptions, (request, response) => {
					_this._onRequest(_this, request, response);
				}).listen(this.port);
				break;
		}
	}

	/**
	 * @private
	 * @param {Server} server
	 * @param {Error} error
	 * @memberOf Server
	 */
	_onError(server, error) {
		log.error("Internal Server Error", error);

		if (!config.DevMode) {
			server.onErrRes.setResponseCode(500);
			server.onErrRes.setContent("");
			server.onErrRes = new ResponseCodeMessage(server.onErrRes).prepareAndGetResponse(true);
			server.onErrRes.send();
		}

		process.exit(1);
	}

	// TODO give the return value more meaning / sense or remove it
	/**
	 * @private
	 * @param {Server} server
	 * @param {http.ClientRequest} request
	 * @param {ResponseWrapper} response
	 * @returns {boolean} whether the requested content could be send or not
	 * @memberOf Server
	 */
	_processRequest(server, request, response) {
		const queryPath = url.parse(request.url).path;
		const queryString = url.parse(request.url).query;

		if (config.DevMode) {
			log.info(`process_request: ${request.url}`);
		}

		if (!server.router.routeExists(queryPath)) {
			if (config.DevMode) {
				log.info(`404: ${(queryPath === undefined ? "undefined" : queryPath)}`);
			}

			response.setResponseCode(404);
			response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
			response.send();
			return false;
		}

		if (server.router.getRoute(queryPath).handler === server.requestHandler.get("Static") && (request.headers["cache-control"] !== "no-cache")) {
			/** @type {string} */
			const filePath = Helper.replaceAll("/", Helper.GetFsDelimiter(), config.staticContentPath);

			/** @type {Date} */
			let lastModified;

			if (queryPath === "/favicon.ico") {
				lastModified = new Date(fs.statSync(`${filePath}${Helper.GetFsDelimiter()}favicon.ico`).mtime).toUTCString();
			} else if (queryPath === "/worker-html.js") {
				lastModified = new Date(fs.statSync(`${filePath}${Helper.GetFsDelimiter()}worker-html.js`).mtime).toUTCString();
			} else {
				/** @type {string} */
				const file = filePath + Helper.GetFsDelimiter() + querystring.parse(queryString).f;

				try {
					fs.accessSync(file, fs.F_OK);
					lastModified = new Date(fs.statSync(file).mtime).toUTCString(); // TODO fix this
				} catch (error) {
					response.setResponseCode(404);
					response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
					response.send();
					return false;
				}
			}

			if (lastModified === request.headers["if-modified-since"]) {
				response.setResponseCode(304);
				response.setLastModified(lastModified);
				response.send();
			}
		}

		const cacheLastModified = server.cache.getLastModified(request);
		const cacheHasRequest = server.cache.has(request);

		if (cacheHasRequest && request.headers["if-modified-since"] === cacheLastModified) {
			response.setResponseCode(304);
			response.setLastModified(cacheLastModified);
			response.send();
		} else {
			const deliverCache = !(config.HandleClientCacheControl && request.headers["cache-control"] === "no-cache");
			const writeCache = server.router.routeGetCacheEnabled(queryPath);

			if (deliverCache && cacheHasRequest) {
				server.cache.send(request, response);
				return false;
			}

			let data = server.router.route(queryPath, request);

			if (request.method === "POST") {
				let body = "";

				// TODO test the behavior of "this" at the anonymus delegate level!
				request.on("data", (postData) => {
					// reading http POST body
					if (body.length + postData.length < config.MaxHttpPOSTSize) {
						body += postData;
					} else {
						// Request entity too large
						response.setResponseCode(413);
						response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
						response.send();
						return false;
					}

					return true;
				});

				request.on("end", () => {
					// after reading the http POST body, call the callback function "data()" returned from the request handler
					server._sendData(data(server.router.getRoute(queryPath).handler, body, request), request, response, writeCache);
				});
			} else if (request.method === "GET") {
				if (!server._sendData(data, request, response, writeCache)) {
					return false;
				}
			} else {
				// unknown http method
				response.setResponseCode(501);
				response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
				response.send();
				return false;
			}
		}

		return true;
	}

	/**
	 * @private
	 * "data.type" MUST be set to a valid http status code (default: 500 "Internal Server Error") returns false if response has been send
	 * @param {Object} data
	 * @param {http.ClientRequest} request
	 * @param {ResponseWrapper} response
	 * @param {boolean} writeCache
	 * @returns {boolean} whether the requested content could be send or not
	 * @memberOf Server
	 */
	_sendData(data, request, response, writeCache) {
		if (!data || !data.type) {
			response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
			response.send();
			return false;
		}

		if (data.mimetype) {
			response.setContentType(data.mimetype);
		}

		if (data.code) {
			response.setResponseCode(data.code);
		}

		if (data.type === "file" && data.content) {
			response.setResponseCode(data.code || 200);
			response.setLastModified(new Date(fs.statSync(data.content).mtime).toUTCString());
			response.contentLength = fs.statSync(data.content).size;
			response.sendFileStream(fs.createReadStream(data.content));
			return false;
		}

		if (data.content) {
			response.setContent(data.content);
		}

		response = new ResponseCodeMessage(response).prepareAndGetResponse(true);

		if (writeCache && (data.code > 99 && data.code < 300)) {
			this.cache.add(request, data.content, data.mimetype, data.code);
			response.setLastModified(this.cache.getLastModified(request));
		}

		if (config.EnableHttp2 && config.Https.Enabled && data.push) {
			// TODO test the behavior of "this" at the anonymus delegate level!
			data.push.forEach((element) => {
				response.addHttp2PushEntity(element.path, element.data, element.httpCode, element.header);
			}, this);
		}

		response.send();
		return true;
	}
}

module.exports = Server;
