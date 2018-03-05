// handle request
// file restrictions
const path = require("path");
module.exports = function(request, response, uri, root) {
    var filepath = path.resolve(path.join(root, uri.pathname));
    
    if (!path.resolve(filepath).startsWith(root)
    || uri.pathname.endsWith('/package.json')
    || uri.pathname.endsWith('/node_modules')
    || uri.pathname.endsWith('/gulpfile.js')
    || uri.pathname.endsWith('mini-server.js')
    || uri.pathname.endsWith('mini-server.json')
    ) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.end('404 Not Found\n');

        return true;
    }
}
