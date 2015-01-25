var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";
var CountPosts = _Config.post.CountPosts || 10;
var MessageNextPage = _Config.post.MessageNextPage || "Next";
var MessageLastPage = _Config.post.MessageLastPage || "Prev";
var MessageEnd = _Config.post.MessageEnd || "The end.";

function Index(request, response) {
    _writeHead["_200"](response);

    _fs.readFile(FileHeader, 'utf8', function (error, data) {
        index(error, data, request, response);
    });
}

function index(error, header, request, response) {
    response.write(header);

    var posts = _helper.getPosts();
    var counter = 0;
    var queryOffset = offset = parseInt(_querystring.parse(_url.parse(request.url).query)["offset"], 10);
    var foundSomeThing = false;
    var printEndMessage = false;

    if (isNaN(offset) || offset < 0) {
        queryOffset, offset = 0;
    }

    response.write('\n<ul>\n');

    for (var i = 0; i < posts.length; i++) {

        if (counter < CountPosts) {
                if (queryOffset > 0) {
                    queryOffset--;
                } else {
                    response.write('<li>');
                    response.write('[<a href="post/?p=' + posts[i] + '">post</a>] ');
                    response.write(_helper.getPost(posts[i]));
                    response.write('</li>\n');
                    counter++;
                    foundSomeThing = true;
                }

        } else {
            break;
        }
    }

    response.write('</ul>\n\n');

    if (foundSomeThing === false || counter < CountPosts) {
        response.write('<div style="text-align:center"><h2>' + MessageEnd + '</h2></div>');
        counter = 1;
        printEndMessage = true;
    }

    // print link to last and/or/not to the next and last page.
    var lastPage = (((offset - counter) < 0) ? 0 : (offset - counter));

    response.write('<div style="text-align:center">');

    if (lastPage > 0) {
        if (foundSomeThing === false) {
            lastPage = (((offset - CountPosts) < 0) ? 0 : (offset - CountPosts));
        }
        if (printEndMessage === true) {
            lastPage += 1;
            lastPage -= CountPosts;
        }

        if (lastPage < 1) {
            response.write('<a href=".">' + MessageLastPage + '</a>');
        } else {
            response.write('<a href="?offset=' + lastPage + '">' + MessageLastPage + '</a>');
        }
    } else if (foundSomeThing === true && counter === CountPosts) {
        response.write('<a href=".">' + MessageLastPage + '</a>');
    }

    if ((lastPage > 0 && foundSomeThing === true ) || (foundSomeThing === true && counter === CountPosts)) {
        response.write(' | ');
    }

    if (foundSomeThing === true && counter === CountPosts) {
        response.write('<a href="?offset=' + (offset + counter) + '">' + MessageNextPage + '</a>');
    }
    response.write('</div>\n</body>\n');

    response.end();
}


exports.Index = Index;
