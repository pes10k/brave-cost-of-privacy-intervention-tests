#!/usr/bin/env node

import { setTimeout } from 'node:timers/promises'

import { ArgumentParser, ArgumentDefaultsHelpFormatter } from 'argparse'

import { makeTestClient, makeDriver } from './cost-of-privacy-intervention-tests/browsers.js'
import { createTestServer } from './cost-of-privacy-intervention-tests/server.js'

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
parser.add_argument('--host2', {
  default: '127.0.0.1',
  help: 'The host to use for the second server to run checks against.'
})
parser.add_argument('--port', {
  default: 8080,
  type: 'int',
  help: 'The port to use for the first server to run checks against.'
})
parser.add_argument('--timeout', {
  default: 3000,
  type: 'int',
  help: 'Number of milliseconds to wait between test steps.'
})

const args = parser.parse_args()

const onResults = (serverHandle, results) => {
  console.log('received results')
  console.log(JSON.stringify(results))
}

;(async () => {
  const context = {
    host1: args.host1,
    host2: args.host2,
    port: args.port
  }

  const driver = makeDriver(args.driver, args.binary, args.profile)
  const client1 = makeTestClient(driver, args.host1, args.port, context)
  const client2 = makeTestClient(driver, args.host2, args.port, context)

  createTestServer(args.host1, args.host2, args.port, onResults)

  await setTimeout(args.timeout)

  await client1.visitClearStatePage()
  await setTimeout(args.timeout)

  await client2.visitClearStatePage()
  await setTimeout(args.timeout)

  await client1.visitTestPage()
  await setTimeout(args.timeout)

  await client2.visitTestPage()
  await setTimeout(args.timeout)

  await driver.quit()
})()
