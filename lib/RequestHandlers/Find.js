var querystring = require("querystring");
var url = require("url");

var FileHeader = Config.post.FileHeader || "header.html";
var FileFooter = Config.post.FileFooter || "footer.html";
var DirectoryPosts = Config.post.DirectoryPosts || "posts";

function Find(request) {
	const response = {
		type: "error",
		code: 404,
		content: "nothing found!",
		mimetype: "text/plain"
	};

	let query;
	{
		query = querystring.parse(url.parse(request.url).query);
		let tmp = null;
		Object.keys(query).forEach(function(member) {
			if (!(query[member] == " ")) {
				tmp = query[member];
			}
		});
		query = unescape(tmp);
	}

	if (query == "null") query = unescape(request.url.split("/").pop());

	let postsData = [];
	let postIds = [];
	let matched = [];
	let deps = [FileHeader, FileFooter];
	let content = "<ul>\n";

	if (!query) return response;
	if (!query.match(/[\w\d\s\-]+$/)) return response;

	let regex = new RegExp(query, "igm");
	const posts = Helper.getPosts(false);

	for (let index = 0; index < posts.length; index++) {
		let postId = posts[index];
		postsData.push(Helper.getPost(posts[index]));
		postIds.push(postId);
	}

	for (let index = 0; index < postsData.length; index++) {
		let postData = postsData[index];
		let postId = posts[index];

		let match = postData.title.match(regex);
		if (match) {
			deps.push(DirectoryPosts + Helper.GetFsDelimiter() + postId + ".json");
			matched.push(index);
			continue;
		}

		match = postData.contents.match(regex);
		if (match) {
			deps.push(DirectoryPosts + Helper.GetFsDelimiter() + postId + ".json");
			matched.push(index);
			continue;
		}
	}

	if (matched.length < 1) return response;

	for (let index = 0; index < matched.length; index++) {
		let match = matched[index];
		let postData = postsData[match];
		let postId = posts[match];
		content += "<li>";
		content += "[<a href=\"/post/" + postId + "\">" + postData.title + "</a>] <br><br>";
		content += postData.contents;
		content += "</li>\n";
	}

	content += "</ul>\n\n";

	return {
        type: "content",
        code: 200,
        content: Helper.getPage(content, "Finding: " + query),
        mimetype: "text/html"
    };
}

exports.Find = Find;
