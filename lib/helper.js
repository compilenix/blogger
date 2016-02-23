"use strict";

var DirectoryPosts = Config.post.DirectoryPosts;

function getPosts(noreverse) {
    var data = [];
    var posts;

    if (noreverse) {
        posts = fs.readdirSync(DirectoryPosts);
    } else {
        posts = fs.readdirSync(DirectoryPosts).reverse();
    }

    for (var i = 0; i < posts.length; i++) {
        if (fs.existsSync(DirectoryPosts + GetFsDelimiter() + posts[i] + ".asc")) {
            data.push(posts[i].replace(".json", ""));
        }
    }

    return data;
}

function getTitle(id) {
    return getPost(id).title;
}

function getTitles(noreverse) {
    var data = [];
    var list = getPosts(noreverse);

    for (var i = 0; i < list.length; i++) {
        data.push(getTitle(list[i]));
    }

    return data;
}

function writePost(id, content, title) {
    var data = JSON.stringify({
        title: title,
        contents: content
    });

    fs.writeFileSync(DirectoryPosts + GetFsDelimiter() + id + ".json", data, "utf8");
    fs.writeFileSync(DirectoryPosts + GetFsDelimiter() + id + ".json.asc", "", "utf8");
}

function removePost(id) {
    if (postExists(id)) {
        fs.unlinkSync(DirectoryPosts + GetFsDelimiter() + id + ".json");
        fs.unlinkSync(DirectoryPosts + GetFsDelimiter() + id + ".json.asc");
    }
}

function postExists(id) {
    if (fs.existsSync(DirectoryPosts + GetFsDelimiter() + id + ".json")) {
        return true;
    }
    return false;
}

function getPost(id) {
    if (fs.existsSync(DirectoryPosts + GetFsDelimiter() + id + ".json.asc")) {
        return JSON.parse(fs.readFileSync(DirectoryPosts + GetFsDelimiter() + id + ".json", "utf8"));
    } else {
        return "";
    }
}

function getPage(content) {
    var header = fs.readFileSync("lib" + GetFsDelimiter() + Config.post.FileHeader, "utf8");
    var footer = fs.readFileSync("lib" + GetFsDelimiter() + Config.post.FileFooter, "utf8");
    return header + content + footer;
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), replace);
};

function GetFsDelimiter() {
    switch (os.platform()) {
        case "darvin":
        case "freebsd":
        case "linux":
        case "sunos":
        default:
            return "/";
        case "win32":
            return "\\";
    }
}


exports.getPost = getPost;
exports.getPosts = getPosts;
exports.getPage = getPage;
exports.writePost = writePost;
exports.removePost = removePost;
exports.postExists = postExists;
exports.replaceAll = replaceAll;
exports.getTitle = getTitle;
exports.getTitles = getTitles;
exports.GetFsDelimiter = GetFsDelimiter;
