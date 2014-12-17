var fs = require('fs');

var Options = {
    FileHeader: "header.html",
    FileFooter: "footer.html",
    DirectoryPosts: "posts",
    CountPosts: 3
}

function Index(response) {
    console.log("Request handler 'Index' was called.");
    response.writeHead(200, { "Conten-Type": "text/html", "Server": "node.js/" + process.version });

    fs.readFile(Options.FileHeader, 'utf8', function (error, data) {
        if (error) {
            //console.log(error);
        }
        response.write(data);

        var posts = fs.readdirSync(Options.DirectoryPosts).reverse();
        var counter = 0;

        for (var i = 0; i < posts.length; i++) {

            if (counter < Options.CountPosts) {

                if (fs.existsSync(Options.DirectoryPosts + '/' + posts[i] + ".asc")) {
                    response.write(fs.readFileSync(Options.DirectoryPosts + '/' + posts[i], 'utf8'));
                    counter++;
                }

            } else {
                break;
            }
        }

        //response.write('<p><div style="text-align:center"><a href="?offset=' + counter + '">Next Page</a></div></p>');

        response.end();
    });
}

function Favicon(response) {
    console.log("Request handler 'Favicon' was called.");
    response.writeHead(200, { "Conten-Type": "image/x-icon", "Server": "node.js/" + process.version });

    fs.readFile('favicon.ico', function (error, data) {
        if (error) {
            //console.log(error);
        }
        response.write(data);
        response.end();
    });
}

exports.Index = Index;
exports.Favicon = Favicon;
exports.Options = Options;
