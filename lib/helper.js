var os = require("os");
var fs = require("fs");
var htmlencode = require("htmlencode").htmlEncode;

var DirectoryPosts = Config.post.DirectoryPosts;

function getPosts(noreverse) {
    const data = [];
    var posts;

    if (noreverse) {
        posts = fs.readdirSync(DirectoryPosts);
    } else {
        posts = fs.readdirSync(DirectoryPosts).reverse();
    }

    for (let i = 0; i < posts.length; i++) {
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
    const data = [];
    const list = getPosts(noreverse);
    for (let i = 0; i < list.length; i++) {
        data.push(getTitle(list[i]));
    }

    return data;
}

function writePost(id, content, title) {
    const data = JSON.stringify({
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

function prepareHeaderHtml(title, header) {
    if (!header) {
        header = fs.readFileSync("lib" + GetFsDelimiter() + Config.post.FileHeader, "utf8");
    }

    if (title && title != "undefined" && title != null) {
        header = replaceAll("{{Title}}", htmlencode(Config.Title + " - " + title), header);
    } else {
        header = replaceAll("{{Title}}", htmlencode(Config.Title), header);
    }

    header = replaceAll("{{Author}}", htmlencode(Config.author), header);
    header = replaceAll("{{StaticContent_Ubuntu-R}}", Config.staticContentUri + "Ubuntu-R.ttf", header);
    header = replaceAll("{{StaticContent_Ubuntu-B}}", Config.staticContentUri + "Ubuntu-B.ttf", header);
    header = replaceAll("{{StaticContent_ace.js}}", Config.staticContentUri + "ace.js", header);
    header = replaceAll("{{StaticContent_jquery.js}}", Config.staticContentUri + "jquery.js", header);
    header = replaceAll("{{StaticContent_mode-html.js}}", Config.staticContentUri + "mode-html.js", header);
    header = replaceAll("{{StaticContent_worker-html.js}}", Config.staticContentUri + "worker-html.js", header);
    header = replaceAll("{{StaticContent_theme-monokai.js}}", Config.staticContentUri + "theme-monokai.js", header);
    header = replaceAll("{{StaticContent_inactivel.png}}", Config.staticContentUri + "inactivel.png", header);
    header = replaceAll("{{StaticContent_inactivec.png}}", Config.staticContentUri + "inactivec.png", header);
    header = replaceAll("{{StaticContent_activec.png}}", Config.staticContentUri + "activec.png", header);
    header = replaceAll("{{StaticContent_inactiveclose.png}}", Config.staticContentUri + "inactiveclose.png", header);
    header = replaceAll("{{StaticContent_activeclose.png}}", Config.staticContentUri + "activeclose.png", header);
    header = replaceAll("{{StaticContent_activel.png}}", Config.staticContentUri + "activel.png", header);
    header = replaceAll("{{StaticContent_activer.png}}", Config.staticContentUri + "activer.png", header);
    header = replaceAll("{{StaticContent_doc.png}}", Config.staticContentUri + "doc.png", header);

    return header;
}

function getPage(content, title) {
    const footer = fs.readFileSync("lib" + GetFsDelimiter() + Config.post.FileFooter, "utf8");
    const header = prepareHeaderHtml(title);
    return header + content + footer;
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), replace);
}

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
exports.prepareHeaderHtml = prepareHeaderHtml;
exports.writePost = writePost;
exports.removePost = removePost;
exports.postExists = postExists;
exports.replaceAll = replaceAll;
exports.getTitle = getTitle;
exports.getTitles = getTitles;
exports.GetFsDelimiter = GetFsDelimiter;
