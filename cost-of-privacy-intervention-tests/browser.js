import { spawn } from 'node:child_process'

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

export const buildBrowserClient = (logger, browserType, browserCmd) => {
  let currentlyCrawlingUrl

  return {
    visitUrl: (url) => {
      if (currentlyCrawlingUrl !== undefined) {
        throw new Error(`Already crawling ${currentlyCrawlingUrl}`)
      }
      currentlyCrawlingUrl = url

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
        close: () => {
          return childProcess.kill()
        }
      }
    }
  }
}
