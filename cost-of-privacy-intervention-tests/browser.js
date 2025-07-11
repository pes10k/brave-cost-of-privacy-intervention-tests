import { spawn } from 'node:child_process'

import { Builder, Browser } from 'selenium-webdriver'

const chromiumArguments = (url) => {
  const cacheBustUrl = url + '&cache=' + Date.now()
  return [cacheBustUrl]
}

const geckoArguments = (url) => {
  const cacheBustUrl = url + '&cache=' + Date.now()
  return ['--url', cacheBustUrl]
}

const webkitArguments = (url) => {
  return ['--url', url]
}

const makeSafariClient = (logger, browserCmd) => {
  const driver = new Builder()
    .forBrowser(Browser.SAFARI)
    .build()

  return {
    visitUrl: async (url) => {
      await driver.get(url)
      return {
        close: async () => {
          await driver.quit()
        }
      }
    }
  }
}

const makeOtherClient = async (logger, browserCmd, browserType) => {
  return {
    visitUrl: async (url) => {
      let additionalArgs = []
      switch (browserType) {
        case 'chromium':
          additionalArgs = chromiumArguments(url)
          break
        case 'gecko':
          additionalArgs = geckoArguments(url)
          break
        case 'webkit':
          additionalArgs = webkitArguments(url)
          break
        default:
          throw new Error(`Unknown browser family: ${browserType}`)
      }

      logger('Spawning: ' + browserCmd.join(' '))
      const gotoCmd = browserCmd.concat(additionalArgs)
      const childProcess = spawn(gotoCmd[0], gotoCmd.slice(1))

      return {
        close: async () => {
          return childProcess.kill()
        }
      }
    }
  }
}

export const buildClient = async (logger, browserCmd, browserType) => {
  if (browserType === 'safari') {
    return await makeSafariClient(logger, browserCmd)
  } else {
    return await makeOtherClient(logger, browserCmd, browserType)
  }
}
