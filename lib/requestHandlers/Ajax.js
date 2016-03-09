"use strict";

function Ajax(request) {
    var response = {
        type: "error",
        code: 500
    };

    switch (request.method) {
        case "POST":
            return process_post;
        case "GET":
            response.content = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
            response.mimetype = "application/json";
            response.code = 400;
            break;
        default:
            response.code = 501;
            break;
    }

    return response;
}

function process_post(data, request) {
    var response = {
        type: "error",
        code: 500
    };

    const post = querystring.parse(data);

    if (!checkApiKey(post.apikey)) {
        response.content = "{}";
        response.mimetype = "application/json";
        response.code = 403;
        return response;
    }

    var ret;
    switch (post.action) {
        case "postlist":
            ret = postList();
            response.mimetype = "application/json";
            response.code = 200;
            break;
        case "getpost":
            ret = getPost(post);
            response.mimetype = "application/json";

            if (ret === "{}") {
                ret = "{\n\t\"code\": 404,\n\t\"content\": \"Not Found\"\n}";
                response.code = 404;
            } else {
                response.code = 200;
            }
            break;
        case "writepost":
            ret = writePost(post);
            response.mimetype = "application/json";

            if (ret === "{}") {
                ret = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
                response.code = 400;
            } else {
                response.code = 200;
            }
            break;
        case "removepost":
            ret = removePost(post);
            response.mimetype = "application/json";

            if (ret === "{}") {
                ret = "{\n\t\"code\": 400,\n\t\"content\": \"Bad Request\"\n}";
                response.code = 400;
            } else {
                response.code = 200;
            }
            break;
        case "previewpost":
            ret = previewPost(post);
            response.mimetype = "text/html";

            if (ret === "") {
                response.code = 400;
            } else {
                response.code = 200;
            }
            break;
        default:
            ret = "{}";
            response.code = 400;
            response.mimetype = "application/json";
            break;
    }

    response.content = ret;
    return response;
}

function postList() {
    return JSON.stringify({ type: "postlist", list: Helper.getPosts(false), titles: Helper.getTitles(false) });
}

function getPost(post) {
    if (post.postid) {
        return JSON.stringify({ type: "post", id: post.postid, content: Helper.getPost(post.postid), title: Helper.getTitle(post.postid) });
    } else {
        return "{}";
    }
}

function writePost(post) {
    if (post && post.content && post.title) {
        Helper.writePost(post.postid, post.content, post.title);
        // TODO clear only needed stuff
        Cache.clear();
        return JSON.stringify({ type: "postsaved", id: post.postid });
    } else {
        return "{}";
    }
}

function removePost(post) {
    if (post && post.postid) {
        Helper.removePost(post.postid);
        // TODO clear only needed stuff
        Cache.clear();
        return JSON.stringify({ type: "postremoved", id: post.postid });
    } else {
        return "{}";
    }
}

function previewPost(post) {
    if (post.content) {
        return Helper.getPage(JSON.parse(post.content) || post.content || "", post.title);
    }
    return "";
}

function checkApiKey(key) {
    return key === Config.APIKey;
}

exports.Ajax = Ajax;
