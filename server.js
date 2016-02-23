"use strict";

var Port = Config.server.port || 80;
var HandleClientCacheControl = Config.HandleClientCacheControl || true;
var DevMode = Config.DevMode || false;

var http = require("http");
var domain = require("domain");

function Start(route) {
    var onErrRes = undefined;

    function onRequest(request, response) {
        const res = new ResponseWrapper(response);

        if (!DevMode) {
            onErrRes = res;
        }

        process_request(request, res, route);
    }

    function onErr(error) {
        console.error("error", error.stack);
        onErrRes.setResponseCode(500);
        onErrRes.setContent("");
        ResponseCodeMessage.ResponseCodeMessage(onErrRes);
        onErrRes.send();
        process.exit(1);
    }

    if (DevMode) {
        http.createServer(onRequest).listen(Port);
    } else {
        const currentDomain = domain.create();
        currentDomain.on("error", onErr);
        currentDomain.run(function() {
            http.createServer(onRequest).listen(Port);
        });
    }
    console.log("Init done.");
}

/*
 * returns bool which is not relevant for the calling instance, used to break the execution
 */
function process_request(request, response, route) {
    const pathname = url.parse(request.url).pathname;

    if (!router.RouteExists(pathname)) {
        if (Config.DevMode) {
            console.log("404: " + (pathname == undefined ? "undefined" : pathname));
        }
        response.setResponseCode(404);
        ResponseCodeMessage.ResponseCodeMessage(response);
        response.send();
        return false;
    }

    if (Cache.has(request) && request.headers["if-modified-since"] === Cache.getLastModified(request)) {
        response.setResponseCode(304);
        response.setLastModified(Cache.getLastModified(request));
        response.send();
    } else {
        const deliverCache = !(HandleClientCacheControl && request.headers["cache-control"] === "no-cache");
        const writeCache = handle[pathname].cache;
        if (deliverCache && Cache.has(request)) {
            response.setLastModified(Cache.getLastModified(request));
            Cache.send(request, response);
            return false;
        }

        var data = route(handle[pathname].callback, request);

        if (request.method === "POST") {
            var body = "";

            request.on("data", function(postData) {
                // reading http POST body
                if (body.length + postData.length < Config.MaxHttpPOSTSize) {
                    body += postData;
                } else {
                    // Request entity too large
                    response.setResponseCode(413);
                    ResponseCodeMessage.ResponseCodeMessage(response);
                    response.send();
                    return false;
                }
                return true;
            });

            request.on("end", function() {
                // after reading the http POST body, call the callback function "data()" from request handler
                sendData(data(body, request), request, response, writeCache);
            });
            return true;
        } else if (request.method === "GET") {
            if (!sendData(data, request, response, writeCache)) {
                return false;
            }
        } else {
            // unknown http method
            response.setResponseCode(501);
            ResponseCodeMessage.ResponseCodeMessage(response);
            response.send();
            return false;
        }

        response.send();
    }

    return true;
}

/*
 * "data.type" MUST be set to a valid http status code (default: 500 "Internal Server Error") 
 * returns false if response has been send
 */
function sendData(data, request, response, writeCache) {
    if (data && data.type) {
        if (data.mimetype) {
            response.setContentType(data.mimetype);
        }

        if (data.code) {
            response.setResponseCode(data.code);
        }

        if (data.type === "file" && data.content) {
            response.setResponseCode(data.code || 200);
            response.sendFileStream(fs.createReadStream(data.content));
            return false;
        }

        if (data.content) {
            response.setContent(data.content);
        }

        ResponseCodeMessage.ResponseCodeMessage(response);
        response.send();

        if (writeCache) {
            Cache.add(request, data.content, data.mimetype, data.code);
            response.setLastModified(Cache.getLastModified(request));
        }

        return true;
    } else {
        ResponseCodeMessage.ResponseCodeMessage(response);
        response.send();
        return false;
    }
}


exports.Start = Start;