var querystring = require('querystring');
var fs = require('fs');
var url = require('url');

var Options = {
    FileHeader: "header.html",
    //FileFooter: "footer.html",
    DirectoryPosts: "posts",
    CountPosts: 1,
    MessageNextPage: "Next",
    MessageLastPage: "Last",
    MessageEnd: "The end.",
}

function Index(request, response) {
    response.writeHead(200, { "Content-Type": "text/html", "Server": "node.js/" + process.version });

    fs.readFile(Options.FileHeader, 'utf8', function (error, data) {
        index(error, data, request, response);
    });
}

function index(error, data, request, response) {
    if (error) {
        //console.log(error);
    }
    response.write(data);

    var posts = fs.readdirSync(Options.DirectoryPosts).reverse();
    var counter = 0;
    var queryOffset = offset = parseInt(querystring.parse(url.parse(request.url).query)["offset"], 10);
    var foundSomeThing = false;
    var printEndMessage = false;

    if (isNaN(offset) || offset < 0) {
        queryOffset, offset = 0;
    }

    for (var i = 0; i < posts.length; i++) {

        if (counter < Options.CountPosts) {

            if (fs.existsSync(Options.DirectoryPosts + '/' + posts[i] + ".asc")) {

                if (queryOffset > 0) {
                    queryOffset--;
                } else {
                    response.write(fs.readFileSync(Options.DirectoryPosts + '/' + posts[i], 'utf8'));
                    counter++;
                    foundSomeThing = true;
                }
            }

        } else {
            break;
        }
    }

    if (foundSomeThing === false || counter < Options.CountPosts) {
        response.write('<div style="text-align:center"><h2>' + Options.MessageEnd + '</h2></div>');
        counter = 1;
        printEndMessage = true;
    }

    // print link to last and/or/not to the next and last page.
    var lastPage = (((offset - counter) < 0) ? 0 : (offset - counter));

    response.write('<div style="text-align:center">');

    if (lastPage > 0) {
        if (foundSomeThing === false) {
            lastPage = (((offset - Options.CountPosts) < 0) ? 0 : (offset - Options.CountPosts));
        }
        if (printEndMessage === true) {
            lastPage += 1;
            lastPage -= Options.CountPosts;
        }

        if (lastPage < 1) {
            response.write('<a href=".">' + Options.MessageLastPage + '</a>');
        } else {
            response.write('<a href="?offset=' + lastPage + '">' + Options.MessageLastPage + '</a>');
        }
    } else if (foundSomeThing === true && counter === Options.CountPosts) {
        response.write('<a href=".">' + Options.MessageLastPage + '</a>');
    }

    if ((lastPage > 0 && foundSomeThing === true ) || (foundSomeThing === true && counter === Options.CountPosts)) {
        response.write(' | ');
    }

    if (foundSomeThing === true && counter === Options.CountPosts) {
        response.write('<a href="?offset=' + (offset + counter) + '">' + Options.MessageNextPage + '</a>');
    }
    response.write('</div>');

    response.end();
}

function Favicon(request, response) {
    response.writeHead(200, { "Content-Type": "image/x-icon", "Server": "node.js/" + process.version });

    fs.readFile('favicon.ico', function (error, data) {
        if (error) {
            //console.log(error);
        }
        response.end(data);
    });
}

exports.Index = Index;
exports.Favicon = Favicon;
exports.Options = Options;
