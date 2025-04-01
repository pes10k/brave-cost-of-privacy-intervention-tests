import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

export const paths = {
  clearRequest: '/clear',
  testPage: '/test.html',
  testJS: '/test.js',
  testImage: '/test.png',
  reportRequest: '/report'
}

const readUTF8FileSync = (path) => {
  return readFileSync(path, { encoding: 'utf8' })
}

const testPageHtml = readUTF8FileSync('./test-resources/test.html')
const testPageJs = readUTF8FileSync('./test-resources/test.js')
const blueSquarePng = readFileSync('./test-resources/blue-square.png')
const purpleSquarePng = readFileSync('./test-resources/purple-square.png')

const handleGETClearStateRequest = (request, response) => {
  response.statusCode = 200
  response.setHeader('Clear-Site-Data', '*')
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.end('<h1>State cleared</h1>')
}

const handleGETTestPageRequest = (request, response) => {
  response.statusCode = 200
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.end(testPageHtml)
}

const handleGETTestJSRequest = (request, response) => {
  response.statusCode = 200
  response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
  response.end(testPageJs)
}

const handleGETImageRequest = (request, response) => {
  const requestReferrer = new URL(request.getHeader('referrer'))
  const isSameSiteRequest = request.host === requestReferrer.host
  const imageData = isSameSiteRequest ? blueSquarePng : purpleSquarePng
  response.statusCode = 200
  response.setHeader('Content-Type', 'image/png')
  response.setHeader('Cache-Control', 'max-age=180, public')
  response.end(imageData)
}

const handleGETReport = (request, response) => {
  const requestUrl = new URL(request.url)
  const requestData = JSON.parse(requestUrl.search)
  response.statusCode = 200
  response.setHeader('Content-Type', 'text/plain')
  response.end('Report received')
  return requestData
}

const handleUnexpectedRequest = (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'text/plain'
  })
  response.end('404 Not Found\n')
}

export const createTestServer = (host1, host2, port, callback) => {
  let report1, report2

  const server = createServer((request, response) => {
    const requestUrl = new URL('http://' + request.headers.host + request.url)
    console.error('Received request: ' + requestUrl.toString())

    switch (requestUrl.pathname) {
      case paths.clearRequest:
        handleGETClearStateRequest(request, response)
        break
      case paths.testPage:
        handleGETTestPageRequest(request, response)
        break
      case paths.testJS:
        handleGETTestJSRequest(request, response)
        break
      case paths.testImage:
        handleGETImageRequest(request, response)
        break
      case paths.reportRequest: {
        const report = handleGETReport(request, response)

        if (request.host.startsWith(host1 + ':')) {
          if (report1 === undefined) {
            report1 = report
          } else {
            throw Error('Received duplicate report: ' + request.host)
          }
        } else if (request.host.startsWith(host2 + ':')) {
          if (report2 === undefined) {
            report2 = report
          } else {
            throw Error('Received duplicate report: ' + request.host)
          }
        } else {
          throw Error('Unexpected report received: ' + request.host)
        }

        if (report1 !== undefined && report2 !== undefined) {
          server.close()
          server.closeAllConnections()
          const combinedReports = { report1, report2 }
          callback(server, combinedReports)
        }
      }
        break
      default:
        handleUnexpectedRequest(request, response)
        break
    }
  })
  server.listen(port)
  return server
}
