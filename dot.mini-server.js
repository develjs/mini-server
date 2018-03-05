// doT plugin
const doT  = require("dot"),
    path = require("path"),
    fs   = require("fs");

module.exports = function(request, response, uri, root) {
    var filepath = path.join(root, uri.pathname);
    
    if (uri.pathname.endsWith('/')) filepath += 'index.html';
    if (!filepath.endsWith('.html')) return;
    
    fs.readFile(filepath, function(err, data) {
        if (err) return done(404, '404 Not Found\n');
    
        data = template(filepath, uri.query, data);
        done(200, data, 'text/html');
    })

    function done(code, data, type) {
        response.writeHead(code||200, {"Content-Type": type||"text/plain"});
        response.end(data||"");
    }    
    
    return true;
}

// templating
var DEF = { 'import': template } // global definition
function template(file, params, data) {
    try {
        if (file) data = data || fs.readFileSync(path.resolve(root, file)) || '';
        return doT.template(data, null, DEF)(params||{});
    }
    catch(e){
        return "Error in " + file + ": " + e.toString();
    }
}
