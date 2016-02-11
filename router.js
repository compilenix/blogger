"use strict";

function Route(callback, request) {

    if (typeof callback === "function") {
        return callback(request);
    } else {
        console.log('Request handler found for: "' + url.parse(request.url).pathname + '" but callback is not a function: "' + callback + '"!');
        return {
            type: "error",
            code: 404

        }
    }
}

function RouteExists(pathname) {
    return typeof handle[pathname].callback === "function";
}

exports.Route = Route;
exports.RouteExists = RouteExists;
