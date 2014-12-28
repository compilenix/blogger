var querystring = require('querystring');
var fs = require('fs');
var url = require('url');

var Options = {
    FileHeader: "header.html",
    //FileFooter: "footer.html",
    DirectoryPosts: "posts",
    CountPosts: 10,
    MessageNextPage: "Next",
    MessageLastPage: "Prev",
    MessageEnd: "The end.",
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
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

    response.write('\n<ul>\n');

    for (var i = 0; i < posts.length; i++) {

        if (counter < Options.CountPosts) {

            if (fs.existsSync(Options.DirectoryPosts + '/' + posts[i] + ".asc")) {

                if (queryOffset > 0) {
                    queryOffset--;
                } else {
                    response.write('<li>');
                    response.write('[<a href="post/?q=' + posts[i].replace(".html", '') + '">post</a>] ');
                    response.write(replaceAll('\n', '', fs.readFileSync(Options.DirectoryPosts + '/' + posts[i], 'utf8')));
                    response.write('</li>\n');
                    counter++;
                    foundSomeThing = true;
                }
            }

        } else {
            break;
        }
    }

    response.write('</ul>\n\n');

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
    response.write('</div>\n</body>\n');

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

function Post(request, response) {
    fs.readFile(Options.FileHeader, 'utf8', function (error, data) {
        post(error, data, request, response);
    });
}

function post(error, data, request, response) {
    if (error) {
        //console.log(error);
    }

    var posts = fs.readdirSync(Options.DirectoryPosts).reverse();
    var query = querystring.parse(url.parse(request.url).query)["q"];
    var letters = new RegExp('^[A-Za-z0-9]+$');

    if(query !== undefined && query !== null && query.match(letters)) {
        if (fs.existsSync(Options.DirectoryPosts + '/' + query + ".html.asc")) {
            response.writeHead(200, { "Content-Type": "text/html", "Server": "node.js/" + process.version });
            response.write(data);
            response.write(fs.readFileSync(Options.DirectoryPosts + '/' + query + '.html', 'utf8'));
        } else {
            response.writeHead(404, { "Content-Type": "text/html", "Server": "node.js/" + process.version });
            response.write('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>');
        }
    } else {
        response.writeHead(404, { "Content-Type": "text/html", "Server": "node.js/" + process.version });
        response.write('<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>');
    }

    response.end();
}


exports.Index = Index;
exports.Post = Post;
exports.Favicon = Favicon;
exports.Options = Options;
