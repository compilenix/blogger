var fs = require('fs');
var querystring = require('querystring');
var url = require('url');

var Options = {
    FileHeader: "header.html",
    DirectoryPosts: "posts"
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
    var query = querystring.parse(url.parse(request.url).query)["p"];
    var letters = new RegExp('^[A-Za-z0-9]+$');

    if(query !== undefined && query !== null && query.match(letters)) {
        if (fs.existsSync(Options.DirectoryPosts + '/' + query + ".html.asc")) {
            _writeHead["_200"](response);
            response.write(data);
            response.write(fs.readFileSync(Options.DirectoryPosts + '/' + query + '.html', 'utf8'));
        } else {
            _writeHead["_404"](response);
        }
    } else {
        _writeHead["_404"](response);
    }

    response.end();
}


exports.Post = Post;
