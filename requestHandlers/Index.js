
var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";
var CountPosts = _Config.post.CountPosts || 10;
var MessageNextPage = _Config.post.MessageNextPage || "Next";
var MessageLastPage = _Config.post.MessageLastPage || "Prev";
var MessageEnd = _Config.post.MessageEnd || "The end.";

function Index(request, response) {
    _fs.readFile(FileHeader, 'utf8', function (error, data) {
        index(error, data, request, response);
    });
}

function index(error, header, request, response) {

    var htmlCode = 200;
    var dataToSend = header;

    var posts = _helper.getPosts();
    var counter = 0;
    var queryOffset = offset = parseInt(_querystring.parse(_url.parse(request.url).query)["offset"], 10);
    var foundSomeThing = false;
    var printEndMessage = false;

    if (isNaN(offset) || offset < 0) {
        queryOffset, offset = 0;
    }

    dataToSend += '<ul>\n';

    for (var i = 0; i < posts.length; i++) {

        if (counter < CountPosts) {
                if (queryOffset > 0) {
                    queryOffset--;
                } else {
                    dataToSend += '<li>';
                    dataToSend += '[<a href="post/?p=' + posts[i] + '">post</a>] ';
                    dataToSend += _helper.getPost(posts[i]);
                    dataToSend += '</li>\n';
                    counter++;
                    foundSomeThing = true;
                }

        } else {
            break;
        }
    }

    dataToSend += '</ul>\n\n';

    if (foundSomeThing === false || counter < CountPosts) {
        dataToSend += '<div style="text-align:center"><h2>' + MessageEnd + '</h2></div>';
        counter = 1;
        printEndMessage = true;
    }

    // print link to last and/or/not to the next and last page.
    var lastPage = (((offset - counter) < 0) ? 0 : (offset - counter));

    dataToSend += '<div style="text-align:center">';

    if (lastPage > 0) {
        if (foundSomeThing === false) {
            lastPage = (((offset - CountPosts) < 0) ? 0 : (offset - CountPosts));
        }
        if (printEndMessage === true) {
            lastPage += 1;
            lastPage -= CountPosts;
        }

        if (lastPage < 1) {
            dataToSend += '<a href=".">' + MessageLastPage + '</a>';
        } else {
            dataToSend += '<a href="?offset=' + lastPage + '">' + MessageLastPage + '</a>';
        }
    } else if (foundSomeThing === true && counter === CountPosts) {
        dataToSend += '<a href=".">' + MessageLastPage + '</a>';
    }

    if ((lastPage > 0 && foundSomeThing === true ) || (foundSomeThing === true && counter === CountPosts)) {
        dataToSend += ' | ';
    }

    if (foundSomeThing === true && counter === CountPosts) {
        dataToSend += '<a href="?offset=' + (offset + counter) + '">' + MessageNextPage + '</a>';
    }

    // -----------------------------

    dataToSend += "</div>\n</body>\n";
    
    response.writeHead(htmlCode, { "Content-Type": "text/html", "Content-Length": dataToSend.length, "Server": "node.js/" + process.version});
    response.end(dataToSend);
}


exports.Index = Index;
