/**
 * simplest http-server script with support doT templating for *.html files
 * install:
 *      npm install mime
 * run:
 *      node server.js
 * templating: https://olado.github.io/doT/
 *      in *.html files you can use global data definition throw "def" namespace
 *      use def.import(file, params) for import other templates
 *      use it['param'] for access to request params
 * extend server features:
 *      create *.server.js modules with 
 *          module.exports = function(request, response, uri, root) {
 *              // return true if you will handle this request here
 *          }
 */
'use strict';
const http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    os = require("os"),
    mime = require("mime"),
    conf = require('./package.json')['mini-server'] ||{},
    handles = (conf.handles||[]).map(file => require(path.resolve(file))),
    args = process.argv,
    port = args[(args.indexOf('--port')+1)||-1] || conf.port || 8080,
    root = path.resolve(args[(args.indexOf('--root')+1)||-1] || conf.root || __dirname);

// start server
http.createServer(function(request, response) {
    console.log(request.method + ":" + request.url);
    var uri = url.parse(request.url, true),
        filepath = path.join(root, uri.pathname);

    // handle request externaly
    for (let i=0; i<handles.length; i++)
        if (handles[i](request, response, uri, root))
            return;
    
    // file handler
    fs.stat(filepath, function(err, stat) {
        if (err) return done(404, '404 Not Found\n');
        if (stat.isDirectory()) filepath += '/index.html';

        fs.readFile(filepath, function(err, data) {
            if (err) return done(500, err + "\n");
            
            if (filepath.endsWith('.html'))
                data = template(filepath, uri.query, data);
                
            done(200, data, mime.getType(filepath));
        })
    })

    function done(code, data, type) {
        response.writeHead(code||200, {"Content-Type": type||"text/plain"});
        response.end(data||"");
    }
})

// event handler
.on("error", e=>console.error(e))
.listen(parseInt(port), function() {
    console.log("Starting up http-server. Available on:");
    var ni = os.networkInterfaces();
    for (var i in ni)
        for (var ip in ni[i])
            if (ni[i][ip].family == 'IPv4')
                console.log('    http://'+ ni[i][ip].address + ':' + port);
    console.log("Root: ", root);
    console.log("Hit CTRL-C to stop the server");
});
