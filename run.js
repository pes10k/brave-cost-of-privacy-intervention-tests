#!/usr/bin/env node

const { ArgumentParser, ArgumentDefaultsHelpFormatter } = require('argparse')

const browsersLib = require('./cost-of-privacy-intervention-tests/browsers.js')
const testsLib = require('./cost-of-privacy-intervention-tests/tests.js')

const parser = new ArgumentParser({
  description: 'Test if a browser profile has cost-of-privacy interventions ' +
               'enabled.',
  formatter_class: ArgumentDefaultsHelpFormatter
})
parser.add_argument('--driver', {
  required: true,
  choices: ['safari', 'chrome', 'firefox'],
  help: 'Which selenium driver "family" to use when automating the browser.'
})
parser.add_argument('--binary', {
  help: 'Path to browser binary to use when running tests. This argument is ' +
        'ignored when using safaridriver.'
})
parser.add_argument('--profile', {
  help: 'Path to the profile to use when running tests. This argument is ' +
        'ignored when using safaridriver.'
})
parser.add_argument('--host1', {
  default: 'localhost',
  help: 'The host to use for the first server to run checks against.'
})
parser.add_argument('--port1', {
  default: 8000,
  type: 'int',
  help: 'The port to use for the first server to run checks against.'
})
parser.add_argument('--host2', {
  default: '[::]',
  help: 'The host to use for the second server to run checks against.'
})
parser.add_argument('--port2', {
  default: 8000,
  type: 'int',
  help: 'The port to use for the second server to run checks against.'
})

const args = parser.parse_args()

;(async () => {
  const driver = browsersLib.buildDriver(args.driver, args.binary, args.profile)
  const results = testsLib.run(driver, args.host1, args.port1, args.host2,
    args.port2)
})()
