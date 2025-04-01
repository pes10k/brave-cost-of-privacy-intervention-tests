const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')

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

const buildDriver = (browser, binaryPath, profilePath) => {
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

module.exports = {
  buildDriver
}
