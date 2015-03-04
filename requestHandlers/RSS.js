var author = _Config.author || "(no author)";
var authorMail = _Config.authorMail || "foobar@foo.bar";
var CountPosts = _Config.rss.CountPosts || 30;
var Description = _Config.rss.Description || "(no description)";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";
var Encoding = _Config.rss.Encoding || "UTF-8";
var language = _Config.language || "en";
var Link = _Config.Link || "/";
var root = _Config.root || "/";
var skipHours = _Config.rss.skipHours || [0, 1, 2, 3, 4, 5];
var Title = _Config.rss.Title || "Blog";
var ttl = _Config.rss.ttl || 60;
var webMaster = _Config.rss.webMaster || "foobar@foo.bar";

function RSS(request, response) {
    var htmlCode = 200;
    var posts = _helper.getPosts();
    var counter = 0;
    var data = "";

    // add rss header
    var dataToSend = generateRssHeader();

    for (var i = 0; i < posts.length; i++) {

        if (counter < CountPosts) {
            if ((data = _helper.getPost(posts[i])) !== '') {
                dataToSend += "<item>\n";
                dataStriped = replaceAll('\n', '', data.replace(/(<([^>]+)>)/ig, '')); // strip html tags and line breaks

                // title
                if (dataStriped.length > 59) { // 64 chars: 60 from the post plus 4 chars: ...
                    dataToSend += '<title>' + dataStriped.substring(0, 60) + ' ...</title>\n';
                } else {
                    dataToSend += '<title>' + dataStriped + ' ...</title>\n';
                }

                // author
                dataToSend += "<author>" + author + " &lt;" + authorMail + "&gt;</author>\n";
                // link
                dataToSend += "<link>" + Link + root + "post/?p=" + posts[i] + "</link>\n";
                // guid
                dataToSend += "<guid>" + Link + root + "post/?p=" + posts[i] + "</guid>\n";
                // date
                dataToSend += "<pubDate>" + new Date(parseInt(posts[i], 16) * 1000) + "</pubDate>\n";
                // content (html)
                dataToSend += "<description><![CDATA[" + data + "]]></description>\n"

                dataToSend += "</item>\n\n";
                counter++;
            }
        }
    }

    dataToSend += '</channel>\n';
    dataToSend += '</rss>\n';

    response.writeHead(htmlCode, { "Content-Type": "application/xml", "Content-Length": dataToSend.length, "Server": "node.js/" + process.version});
    response.end(dataToSend);
}

function generateRssHeader() {
    var skipHoursString = "";
    for (var i = 0; i < skipHours.length; i++) {
        skipHoursString += "<hour>" + skipHours[i] + "</hour>\n";
    }

    var data = '<?xml version="1.0" encoding="' + Encoding + '"?>\n';
    data += '<rss version="2.0">\n';
    data += '<channel>\n';
    data += '<title>' + Title + '</title>\n';
    data += '<link>' + Link + root +'</link>\n';
    data += '<description>' + Description + '</description>\n';
    data += '<generator>' + 'node.js/' + process.version + '</generator>\n';
    data += '<ttl>' + ttl + '</ttl>\n';
    if (skipHoursString !== "") { data += '<skipHours>\n' + skipHoursString + '</skipHours>\n'; }
    data += '<webMaster>' + webMaster + '</webMaster>\n';
    data += '<language>' + language + '</language>\n\n';

    return data;
}


exports.RSS = RSS;
