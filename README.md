# mini-server
nodejs minimalistic extendable http server with support doT templating for *.html files

**Install**
 
      npm i
      
      
**Run**

      node mini-server.js
      
      
**Templating**

Using https://olado.github.io/doT/  
in *.html files you can use global data definition throw "def" namespace  
use def.import(file, params) for import other templates  
use it['param'] for access to request params  


**Extend server features**

create *.mini-server.js modules with 

      module.exports = function(request, response, uri, root) {
          // return true if you will handle this request here
      }
