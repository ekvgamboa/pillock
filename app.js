const http = require('http')
const port = 3000

const server = http.createServer(function(req, res){

})

server.listen(port,function(error){
    if(error){
        console.log('error ',error)
    }
    else{
        console.log('server is listening on port: ' + port)
    }
})
