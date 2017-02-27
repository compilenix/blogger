var fs = require("fs");

const Helper = require("../Helper.js");

var FileHeader = Config.post.FileHeader || "header.html";
var FileFooter = Config.post.FileFooter || "footer.html";
var DirectoryPosts = Config.post.DirectoryPosts || "posts";
var CountPosts = Config.post.CountPosts || 10;
var MessageOlderPage = Config.post.MessageOlderPage || "Older";
var MessageNewerPage = Config.post.MessageNewerPage || "Newer";
var MessageEnd = Config.post.MessageEnd || "The end.";

function Page(request) {
    return page(request, false);
}

function Index(request) {
    return page(request, true);
}

function page(request, index) {
    const posts = Helper.getPosts(true);
    const pageCount = Math.ceil(posts.length / CountPosts);
    const deps = [FileHeader, FileFooter];
	let title = "";
	let requestsToPush = [];

	if (index && Config.EnableHttp2 && Config.Https.Enabled) {
		requestsToPush.push(
			{
				path: Config.staticContentUri + "Ubuntu-R.ttf",
				data: fs.readFileSync(Config.staticContentPath + "Ubuntu-R.ttf", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/x-font-truetype",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "Ubuntu-R.ttf").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "Ubuntu-B.ttf",
				data: fs.readFileSync(Config.staticContentPath + "Ubuntu-B.ttf", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/x-font-truetype",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "Ubuntu-B.ttf").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			},
			{
				path: Config.staticContentUri + "SourceCodePro-Regular.ttf.woff2",
				data: fs.readFileSync(Config.staticContentPath + "SourceCodePro-Regular.ttf.woff2", null),
				httpCode: 200,
				header: {
					"Content-Type": "application/font-woff2",
					"Last-Modified": new Date(fs.statSync(Config.staticContentPath + "SourceCodePro-Regular.ttf.woff2").mtime).toUTCString(),
					"Expires": new Date(Date.now() + (Config.HeaderExpires || 60000 * 10)).toUTCString()
				}
			}
		);
	}

	if (posts.length < 1) {
		return {
			type: "content",
			code: 200,
			content: Helper.getPage("Nothing here, yet.", "Start Page"),
			mimetype: "text/html"
		};
	}

    if (!index) {
        var p = parseInt(request.url.split("/").pop());

        if (isNaN(p) || p < 1) {
            p = 1;
        }

        if (p > pageCount) {
            p = pageCount;
        }

		title = "Page " + p;
    } else {
        p = pageCount;
		title = "Start page";
    }

    var content = "<ul>\n";
    const lastPost = p * CountPosts;
    const firstPost = lastPost - CountPosts;
    for (let i = lastPost; i > firstPost; i--) {
        if (posts[i - 1]) {
            const data = Helper.getPost(posts[i - 1]);
            content += "<li>";
            content += "[<a href=\"/post/" + posts[i - 1] + "\">" + data.title + "</a>] <br><br>";
            content += data.contents;
            content += "</li>\n";
            deps.push(DirectoryPosts + Helper.GetFsDelimiter() + posts[i - 1] + ".json");
        }
    }

    content += "</ul>\n\n";

    if (p == 1) {
        content += "<div style=\"text-align:center\"><h2>" + MessageEnd + "</h2></div>";
    }

    content += "<div style=\"text-align:center\">";

    if (p < pageCount) {
        var older = "<a href=\"/page/" + (p + 1) + "\">" + MessageNewerPage + "</a>";
    }

    if (p > 1) {
        var newer = "<a href=\"/page/" + (p - 1) + "\">" + MessageOlderPage + "</a>";
    }

    if (older && newer) {
        content += older + " <-> " + newer;
    } else if (older) {
        content += older;
    } else if (newer) {
        content += newer;
    }

    content += "</div>\n";

    return {
        type: "content",
        code: 200,
        content: Helper.getPage(content, title),
        mimetype: "text/html",
		push: requestsToPush
    };
}


exports.Page = Page;
exports.Index = Index;
