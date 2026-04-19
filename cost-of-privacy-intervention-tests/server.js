import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

export const paths = {
  start: '/start',
  testPage: '/test.html',
  testJS: '/test.js',
  testStyleSheet: '/style.css',
  fpJs: '/fpjs4.js',
  testImage: '/test.png',
  iframeDocument: '/iframe.html',
  report: '/report'
}

const readUTF8FileSync = (path) => {
  return readFileSync(path, { encoding: 'utf8' })
}

const testPageHtml = readUTF8FileSync('./test-resources/test.html')
const testPageJs = readUTF8FileSync('./test-resources/test.js')
const blueStyleSheet = readFileSync('./test-resources/blue-style.css')
const purpleStyleSheet = readFileSync('./test-resources/purple-style.css')
const blueSquarePng = readFileSync('./test-resources/blue-square.png')
const purpleSquarePng = readFileSync('./test-resources/purple-square.png')
const iframeHtml = readFileSync('./test-resources/iframe.html')
const fpJs = readFileSync('./test-resources/fpjs4.js')

const urlForRequest = (request) => {
  return new URL('http://' + request.headers.host + request.url)
}

const isRequestToFirstHost = (request, context) => {
  const requestUrl = urlForRequest(request)
  return requestUrl.hostname === context.host1
}

const getUrlForSecondHost = (request, context) => {
  return new URL('http://' + context.host2 + ':' + context.port + request.url)
}

const getUrlForPathOnFirstHost = (path, context) => {
  const firstHostURL = new URL('http://' + context.host1 + ':' + context.port + path)
  firstHostURL.search = new URLSearchParams(context)
  return firstHostURL
}

const handleGETStartRequest = (request, response, context) => {
  const nextUrl = isRequestToFirstHost(request, context)
    ? getUrlForSecondHost(request, context)
    : getUrlForPathOnFirstHost(paths.testPage, context)

  response.statusCode = 301
  response.setHeader('Clear-Site-Data', '*')
  response.setHeader('Location', nextUrl.toString())
  response.end(`Redirecting to ${nextUrl.toString()}\n`)
}

const handleGETHtmlRequest = (data, request, response) => {
  response.statusCode = 200
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.end(data)
}

const handleGETTestPageRequest = handleGETHtmlRequest.bind(undefined, testPageHtml)
const handleGETImageIFrameDocumentRequest = handleGETHtmlRequest.bind(undefined, iframeHtml)

const handleGETJSRequest = (data, request, response) => {
  response.statusCode = 200
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
  response.end(data)
}

const handleGETTestJSRequest = handleGETJSRequest.bind(undefined, testPageJs)
const handleGETFpJSRequest = handleGETJSRequest.bind(undefined, fpJs)

const imageRequests = {
  blue: {
    data: blueSquarePng,
    etag: '4c9a82ce72ca2519f38d0af0abbb4cecb9fceca9',
  },
  purple: {
    data: purpleSquarePng,
    etag: 'afaed75406bd414820cea4a5119f90c259c05755'
  }
}
let numImgRequests = 0
const handleGETImageRequest = (request, response) => {
  let data = undefined
  numImgRequests += 1

  if (numImgRequests > 2) {
    console.error('Received unexpected number of image requests: ' + numImgRequests)
  }

  switch (numImgRequests) {
    case 1:
      data = imageRequests.blue
      break
    case 2:
    default:
      data = imageRequests.purple
      break
  }
  response.statusCode = 200
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Content-Type', 'image/png')
  response.setHeader('Cache-Control', 'public, max-age=604800, immutable')
  response.setHeader('ETag', data.etag)
  response.end(data.data)
}

const styleSheetData = {
  blue: {
    data: blueStyleSheet,
    etag: 'blue4c9a82ce72ca2519f38d0af0abbb4cecb9fceca9',
  },
  purple: {
    data: purpleStyleSheet,
    etag: 'purpleafaed75406bd414820cea4a5119f90c259c05755'
  }
}
let numStyleSheetRequests = 0
const handleGETStyleSheetRequest = (request, response) => {
  let data = undefined
  numStyleSheetRequests += 1

  if (numStyleSheetRequests > 2) {
    console.error('Received unexpected number of image requests: ' + numStyleSheetRequests)
  }

  switch (numStyleSheetRequests) {
    case 1:
      data = styleSheetData.blue
      break
    case 2:
    default:
      data = styleSheetData.purple
      break
  }
  response.statusCode = 200
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Content-Type', 'text/css; charset=utf-8')
  response.setHeader('ETag', data.etag)
  response.end(data.data)
}

const handleGETReport = (request, response) => {
  const requestUrl = new URL('http://' + request.headers.host + request.url)
  response.statusCode = 200
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Content-Type', 'text/plain')
  response.end('Report received')
  return JSON.parse(requestUrl.searchParams.get('report'))
}

const handleUnexpectedRequest = (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'text/plain'
  })
  response.end('404 Not Found\n')
}

export const createTestServer = (logger, host1, host2, port, onCompleteCallback, debug = false) => {
  let report1, report2

  const context = { host1, host2, port }
  if (debug === true) {
    context.debug = 'debug'
  }

  const server = createServer((request, response) => {
    const requestUrl = new URL('http://' + request.headers.host + request.url)
    logger('Received request: ' + requestUrl.toString())

    switch (requestUrl.pathname) {
      case paths.start:
        handleGETStartRequest(request, response, context)
        break

      case paths.testPage:
        handleGETTestPageRequest(request, response)
        break

      case paths.testJS:
        handleGETTestJSRequest(request, response)
        break

      case paths.fpJs:
        handleGETFpJSRequest(request, response)
        break

      case paths.testImage:
        handleGETImageRequest(request, response)
        break

      case paths.iframeDocument:
        handleGETImageIFrameDocumentRequest(request, response)
        break

      case paths.testStyleSheet:
        handleGETStyleSheetRequest(request, response)
        break

      case paths.report: {
        const report = handleGETReport(request, response)
        const requestedHost = request.headers.host
        switch (requestedHost) {
          case (host1 + ':' + port):
            if (report1 === undefined) {
              logger(`Received report for ${host1}`)
              logger(report)
              report1 = report
            } else {
              throw Error('Received duplicate report: ' + requestedHost)
            }
            break

          case (host2 + ':' + port):
            if (report2 === undefined) {
              logger(`Received report for ${host2}`)
              logger(report)
              report2 = report
            } else {
              throw Error('Received duplicate report: ' + requestedHost)
            }
            break

          default:
            throw new Error(
              `Received request from unexpected host: ${requestedHost}.\n` +
              `Expected: "${host1 + ':' + port}", "${host2 + ':' + port}"`);
        }
        if (report1 && report2) {
          onCompleteCallback(server, { report1, report2 })
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
