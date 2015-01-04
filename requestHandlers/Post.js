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


exports.Post = Post;
