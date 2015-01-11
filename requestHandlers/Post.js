
var FileHeader = _Config.post.FileHeader || "header.html";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";

function Post(request, response) {
    _fs.readFile(FileHeader, 'utf8', function (error, data) {
        post(error, data, request, response);
    });
}

function post(error, data, request, response) {
    if (error) {
        //console.log(error);
    }

    var posts = _fs.readdirSync(DirectoryPosts).reverse();
    var query = _querystring.parse(_url.parse(request.url).query)["p"];
    var letters = new RegExp('^[A-Za-z0-9]+$');

    if(query !== undefined && query !== null && query.match(letters)) {
        if (_fs.existsSync(DirectoryPosts + '/' + query + ".html.asc")) {
            _writeHead["_200"](response);
            response.write(data);
            response.write(_fs.readFileSync(DirectoryPosts + '/' + query + '.html', 'utf8'));
        } else {
            _writeHead["_404"](response);
        }
    } else {
        _writeHead["_404"](response);
    }

    response.end();
}


exports.Post = Post;
