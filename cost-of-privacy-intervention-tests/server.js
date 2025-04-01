const httpLib = require('node:http')

const createServer = (hostname, port) => {
  const server = httpLib.createServer((req, res) => {
    switch (req.path) {
      case 'test.html':
        break
      case 'report':
        break
      default:
        res.writeHead(404, {
          'Content-Type': 'text/plain'
        })
        res.end('404 Not Found\n')
    }
  })
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })
  return server
}

const testResultsOnHostAndPort = async (hostname, port) => {

}

module.exports = {
  testResultsOnHostAndPort
}
