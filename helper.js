"use strict";

var DirectoryPosts = Config.post.DirectoryPosts || "posts";

function getPosts(noreverse) {
    var data = [];
    if (noreverse) {
        var posts = fs.readdirSync(DirectoryPosts);
    } else {
        var posts = fs.readdirSync(DirectoryPosts).reverse();
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
    var data = []
    var list = getPosts(noreverse);

    for (var i = list.length - 1; i >= 0; i--) {
        data.push(getTitle(list[i]));
    };

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

function getPost(id) {
    if (fs.existsSync(DirectoryPosts + GetFsDelimiter() + id + ".json.asc")) {
        return JSON.parse(fs.readFileSync(DirectoryPosts + GetFsDelimiter() + id + ".json", "utf8"));
    } else {
        return "";
    }
}

function getPage(content) {
    var header = fs.readFileSync((Config.post.FileHeader || "header.html"), "utf8");
    var footer = fs.readFileSync((Config.post.FileFooter || "footer.html"), "utf8");
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
exports.replaceAll = replaceAll;
exports.getTitle = getTitle;
exports.getTitles = getTitles;
exports.GetFsDelimiter = GetFsDelimiter;
