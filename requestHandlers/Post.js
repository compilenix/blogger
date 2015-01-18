
var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request, response) {
    _fs.readFile(FileHeader, 'utf8', function (error, data) {
        post(error, data, request, response);
    });
}

function post(error, data, request, response) {

    var htmlCode = 404;
    var dataToSend = "";
    var posts = _fs.readdirSync(DirectoryPosts).reverse();
    var query = _querystring.parse(_url.parse(request.url).query)["p"];
    var letters = new RegExp('^[A-Za-z0-9]+$');

    if(query !== undefined && query !== null && query.match(letters)) {
        if (_fs.existsSync(DirectoryPosts + '/' + query + ".html.asc")) {
            htmlCode = 200;
            // _writeHead["_200"](response);
            dataToSend += data;
            // response.write(data);
            dataToSend += _fs.readFileSync(DirectoryPosts + '/' + query + '.html', 'utf8');
            // response.write(_fs.readFileSync(DirectoryPosts + '/' + query + '.html', 'utf8'));
        } else {
            htmlCode = 404;
            dataToSend = '<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>';
            // _writeHead["_404"](response);
        }
    } else {
        htmlCode = 404;
        dataToSend = '<html><head><title>404 Not Found</title></head><body bgcolor="white"><center><h1>404 Not Found</h1></center><hr><center>node.js/' + process.version + '</center></body></html>';
        // _writeHead["_404"](response);
    }

    dataToSend += "</body>\n";
    
    // response.writeHead(htmlCode, { "Content-Type": "text/html", "Server": "node.js/" + process.version });
    response.writeHead(htmlCode, { "Content-Type": "text/html", "Content-Length": dataToSend.length, "Server": "node.js/" + process.version});
    response.end(dataToSend);
}


exports.Post = Post;
