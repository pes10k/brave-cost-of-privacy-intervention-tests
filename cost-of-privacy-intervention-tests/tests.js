const serverLib = require('./server.js')

const summarizeResults = (resultFirst, resultSecond) => {
}

const run = async (browser, host1, port1, host2, port2) => {
  const results1 = await serverLib.testResultsOnHostAndPort(host1, port1)
  const results2 = await serverLib.testResultsOnHostAndPort(host2, port2)
  return summarizeResults(results1, results2)
}

module.exports = {
  run
}
