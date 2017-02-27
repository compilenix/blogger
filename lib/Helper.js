var os = require("os");
var fs = require("fs");
var htmlencode = require("htmlencode").htmlEncode;

var DirectoryPosts = Config.post.DirectoryPosts;

// TDOO tranform into class

function getPosts(noreverse) {
	const data = [];
	var posts;

	if (noreverse) {
		posts = fs.readdirSync(DirectoryPosts);
	} else {
		posts = fs.readdirSync(DirectoryPosts).reverse();
	}

	for (let i = 0; i < posts.length; i++) {
		let id = posts[i].replace(".json", "");
		if (isValidPost(id) && fs.existsSync(DirectoryPosts + GetFsDelimiter() + posts[i] + ".asc")) {
			data.push(id);
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
		return true;
	}
	return false;
}

function postExists(id) {
	if (! fs.existsSync(DirectoryPosts + GetFsDelimiter() + id + ".json")) return false;
	try {
		fs.accessSync(DirectoryPosts + GetFsDelimiter() + id + ".json", fs.R_OK);
	} catch (error) {
		return false;
	}
	return true;
}

function isValidPost(id) {
	let data;

	if (! postExists(id)) return false;
	if ((data = fs.readFileSync(DirectoryPosts + GetFsDelimiter() + id + ".json", "utf8")).length < 26) return false;

	try {
		data = JSON.parse(data);
	} catch (error) {
		return false;
	}

	if (data.title && data.contents) return data;

	return false;
}

function getPost(id) {
	let data;
	if ((data = isValidPost(id))) {
		return data;
	} else {
		return "";
	}
}

// TODO use Renderer insted!
// TODO remove
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
	header = replaceAll("{{StaticContent_sweetalert.min.js}}", Config.staticContentUri + "sweetalert.min.js", header);
	header = replaceAll("{{StaticContent_sweetalert.css}}", Config.staticContentUri + "sweetalert.css", header);
	header = replaceAll("{{StaticContent_inactivel.png}}", Config.staticContentUri + "inactivel.png", header);
	header = replaceAll("{{StaticContent_inactiver.png}}", Config.staticContentUri + "inactiver.png", header);
	header = replaceAll("{{StaticContent_inactivec.png}}", Config.staticContentUri + "inactivec.png", header);
	header = replaceAll("{{StaticContent_activec.png}}", Config.staticContentUri + "activec.png", header);
	header = replaceAll("{{StaticContent_inactiveclose.png}}", Config.staticContentUri + "inactiveclose.png", header);
	header = replaceAll("{{StaticContent_activeclose.png}}", Config.staticContentUri + "activeclose.png", header);
	header = replaceAll("{{StaticContent_activel.png}}", Config.staticContentUri + "activel.png", header);
	header = replaceAll("{{StaticContent_activer.png}}", Config.staticContentUri + "activer.png", header);
	header = replaceAll("{{StaticContent_doc.png}}", Config.staticContentUri + "doc.png", header);
	header = replaceAll("{{StaticContent_arrow_left.png}}", Config.staticContentUri + "arrow_left.png", header);
	header = replaceAll("{{StaticContent_arrow_right.png}}", Config.staticContentUri + "arrow_right.png", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Regular.eot}}", Config.staticContentUri + "SourceCodePro-Regular.eot", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Regular.ttf.woff2}}", Config.staticContentUri + "SourceCodePro-Regular.ttf.woff2", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Regular.otf.woff}}", Config.staticContentUri + "SourceCodePro-Regular.otf.woff", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Regular.otf}}", Config.staticContentUri + "SourceCodePro-Regular.otf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Regular.ttf}}", Config.staticContentUri + "SourceCodePro-Regular.ttf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-It.eot}}", Config.staticContentUri + "SourceCodePro-It.eot", header);
	header = replaceAll("{{StaticContent_SourceCodePro-It.ttf.woff2}}", Config.staticContentUri + "SourceCodePro-It.ttf.woff2", header);
	header = replaceAll("{{StaticContent_SourceCodePro-It.otf.woff'}}", Config.staticContentUri + "SourceCodePro-It.otf.woff'", header);
	header = replaceAll("{{StaticContent_SourceCodePro-It.otf}}", Config.staticContentUri + "SourceCodePro-It.otf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-It.ttf}}", Config.staticContentUri + "SourceCodePro-It.ttf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Bold.eot}}", Config.staticContentUri + "SourceCodePro-Bold.eot", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Bold.ttf.woff2}}", Config.staticContentUri + "SourceCodePro-Bold.ttf.woff2", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Bold.otf.woff}}", Config.staticContentUri + "SourceCodePro-Bold.otf.woff", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Bold.otf}}", Config.staticContentUri + "SourceCodePro-Bold.otf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-Bold.ttf}}", Config.staticContentUri + "SourceCodePro-Bold.ttf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-BoldIt.eot}}", Config.staticContentUri + "SourceCodePro-BoldIt.eot", header);
	header = replaceAll("{{StaticContent_SourceCodePro-BoldIt.ttf.woff2}}", Config.staticContentUri + "SourceCodePro-BoldIt.ttf.woff2", header);
	header = replaceAll("{{StaticContent_SourceCodePro-BoldIt.otf.woff}}", Config.staticContentUri + "SourceCodePro-BoldIt.otf.woff", header);
	header = replaceAll("{{StaticContent_SourceCodePro-BoldIt.otf}}", Config.staticContentUri + "SourceCodePro-BoldIt.otf", header);
	header = replaceAll("{{StaticContent_SourceCodePro-BoldIt.ttf}}", Config.staticContentUri + "SourceCodePro-BoldIt.ttf", header);

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
exports.isValidPost = isValidPost;
