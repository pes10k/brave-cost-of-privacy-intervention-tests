#!/usr/bin/env node

import { ArgumentParser, ArgumentDefaultsHelpFormatter } from 'argparse'

import { makeLogger } from './cost-of-privacy-intervention-tests/logging.js'
import { buildBrowserClient } from './cost-of-privacy-intervention-tests/browser.js'
import { createTestServer, paths as testPaths } from './cost-of-privacy-intervention-tests/server.js'

const parser = new ArgumentParser({
  description: 'Test if a browser profile has cost-of-privacy interventions ' +
               'enabled.',
  add_help: true,
  formatter_class: ArgumentDefaultsHelpFormatter
})
parser.add_argument('--browser', {
  choices: ['chromium', 'gecko', 'webkit'],
  required: true,
  help: 'Which browser family is being tested.'
})
parser.add_argument('--host1', {
  default: 'localhost',
  help: 'The first host to use to connect to the test server. ' +
        'This host should be an alias for "localhost".'
})
parser.add_argument('--host2', {
  default: '127.0.0.1',
  help: 'The second host to use to connect to the test server. ' +
        'This host should be an alias for "localhost," and must be different ' +
        'that the --host1 argument.'
})
parser.add_argument('--port', {
  default: 8080,
  type: 'int',
  help: 'The port for the test server to listen on.'
})
parser.add_argument('--verbose', '-v', {
  action: 'store_true',
  help: 'Print verbose execution information.'
})
parser.add_argument('browser-cmd', {
  nargs: '*',
  help: 'Argument to use to launch the browser. Note that this should ' +
        'include all arguments and flags that should be used to launch ' +
        'the browser. To avoid issues with "--" prefixed arguments to pass ' +
        'to the browser, use "--", followed by the full browser command. ' +
        'So, for example: ./run.js --host1 me.local -- ' +
        '/Applications/Brave\\ Browser\\ Nightly.app/Contents/MacOS/Brave\\ Browser\\ Nightly ' +
        '--user-data-dir=/tmp'
})

const args = parser.parse_args()

const logger = makeLogger(args.verbose)
logger('Running with arguments: ')
logger(args)

;(async () => {
  const browserCmd = args['browser-cmd']

  const browserClient = buildBrowserClient(logger, args.browser, browserCmd)
  let closeBrowserHandle = null
  const onResults = (serverHandle, results) => {
    // This goofy check is mostly here just to satisfy the linter, which
    // got confused with `closeBrowserHandle` being `let` instead of `const`
    // despite only being assigned to once.
    if (closeBrowserHandle === null) {
      throw new Error('Trying to shutdown without a browser handle ' +
                      '(should not be possible...)')
    }
    closeBrowserHandle.close()
    serverHandle.close()

    logger('Raw measurement results: ')
    logger(results)

    const summary = {}
    let allTestsPass = true
    for (const key of Object.keys(results.report1)) {
      const isTestPass = results.report1[key] !== results.report2[key]
      summary[key] = isTestPass
      if (!isTestPass) {
        allTestsPass = false
      }
    }
    console.log(summary)
    process.exit(allTestsPass ? 0 : 1)
  }

  logger('Starting server, listening on port ' + args.port)
  createTestServer(logger, args.host1, args.host2, args.port, onResults)

  const context = {
    host1: args.host1,
    host2: args.host2,
    port: args.port
  }
  const startTestUrl = new URL(`http://${args.host1}:${args.port}${testPaths.start}`)
  startTestUrl.search = new URLSearchParams(context)

  logger('Opening browser to URL: ' + startTestUrl.toString())
  closeBrowserHandle = browserClient.visitUrl(startTestUrl.toString())
})()
