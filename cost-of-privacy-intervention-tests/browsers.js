import * as webdriver from 'selenium-webdriver'
import * as chrome from 'selenium-webdriver/chrome.js'
import * as firefox from 'selenium-webdriver/firefox.js'

import { paths as testPaths } from './server.js'

const buildChromeOptions = (binaryPath, profilePath) => {
  const chromeOptions = new chrome.Options()
  chromeOptions.addArguments(`user-data-dir=${profilePath}`)
  chromeOptions.setBinaryPath(binaryPath)
  return chromeOptions
}

const buildFirefoxOptions = (binaryPath, profilePath) => {
  const firefoxOptions = new firefox.Options()
  firefoxOptions.setBinary(binaryPath)
  firefoxOptions.setProfile(profilePath)
  return firefoxOptions
}

export const makeDriver = (browser, binaryPath, profilePath) => {
  const builder = new webdriver.Builder()
  switch (browser) {
    case 'chrome': {
      const chromeOptions = buildChromeOptions(binaryPath, profilePath)
      builder.forBrowser(webdriver.Browser.CHROME)
      builder.setChromeOptions(chromeOptions)
      break
    }
    case 'firefox': {
      const firefoxOptions = buildFirefoxOptions(binaryPath, profilePath)
      builder.forBrowser(webdriver.Browser.FIREFOX)
      builder.setFirefoxOptions(firefoxOptions)
      break
    }
    case 'safari':
      builder.forBrowser(webdriver.Browser.SAFARI)
      break
    default:
      throw Error(`Trying to build driver for unexpected browser: ${browser}`)
  }
  return builder.build()
}

const makeUrl = (host, port, path, args) => {
  let url = `http://${host}:${port}${path}`
  if (args !== undefined) {
    url += `?${encodeURIComponent(JSON.stringify(args))}`
  }
  return url
}

const visitClearStatePage = async (driver, host, port) => {
  await driver.get(makeUrl(host, port, testPaths.clearRequest))
}

const visitTestPage = async (driver, host, port, context) => {
  const testPageUrl = makeUrl(host, port, testPaths.testPage, context)
  await driver.get(testPageUrl)
}

export const makeTestClient = (driver, host, port, context) => {
  return {
    visitClearStatePage: visitClearStatePage.bind(undefined, driver, host, port, context),
    visitTestPage: visitTestPage.bind(undefined, driver, host, port, context)
  }
}
