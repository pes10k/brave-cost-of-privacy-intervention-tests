(async () => {
  const pageUrl = new URL(window.location.toString())
  const context = pageUrl.searchParams

  const storageTestMsg = 'storage test'

  const networkTestKey = 'network'
  const storageTestKey = 'storage'
  const fingerprintTestKey = 'fingerprint'
  const cssTestKey = 'css'
  const numFullReportKeys = 4

  const report = {}

  const setValueInReport = async (key, value) => {
    report[key] = value
    if (Object.keys(report).length < numFullReportKeys) {
      return
    }

    // Send the report here
    const reportURL = new URL(pageUrl)
    reportURL.pathname = '/report'
    reportURL.search = new URLSearchParams({
      report: JSON.stringify(report)
    })
    await fetch(reportURL.toString())

    if (isFirstTestPage) {
      const secondPageUrl = new URL(pageUrl)
      secondPageUrl.hostname = context.get('host2')
      window.location = secondPageUrl.toString()
    } else {
      window.close()
    }
  }

  window.addEventListener('message', async (event) => {
    if (event.data.name !== storageTestMsg) {
      return
    }
    await setValueInReport(storageTestKey, event.data.value || null)
  }, false)

  // Host1 makes a same site request; host2 makes a cross site checks
  const isFirstTestPage = (pageUrl.hostname === context.get('host1'))
  const firstSiteOriginURL = new URL(`${pageUrl.protocol}//${context.get('host1')}:${pageUrl.port}`)

  const localStorageValue = String(Math.random())
  if (isFirstTestPage) {
    window.localStorage.value = localStorageValue
    await setValueInReport(storageTestKey, localStorageValue)
  } else {
    const iframeElm = document.createElement('iframe')
    iframeElm.src = firstSiteOriginURL.toString() + 'empty.html'
    document.body.appendChild(iframeElm)
    window.setTimeout(() => {
      iframeElm.contentWindow.postMessage(
        storageTestMsg, firstSiteOriginURL.toString())
    }, 1000)
  }

  const imgRequestUrl = isFirstTestPage
    ? '/test.png'
    : firstSiteOriginURL.toString() + 'test.png'
  const imgElm = document.createElement('img')
  imgElm.onload = async () => {
    await setValueInReport(networkTestKey, `${imgElm.height}x${imgElm.width}`)
  }
  imgElm.src = imgRequestUrl
  document.body.appendChild(imgElm)

  const styleSheetRequestUrl = isFirstTestPage
    ? `http://${pageUrl.host}/style.css`
    : firstSiteOriginURL.toString() + 'style.css'
  const linkElm = document.createElement('link')
  linkElm.setAttribute('crossorigin', 'anonymous')
  linkElm.setAttribute('rel', 'stylesheet')
  linkElm.onload = async () => {
    const targetDiv = document.getElementById('target-div')
    const style = window.getComputedStyle(targetDiv)
    const backgroundColor = style.getPropertyValue('background-color')
    setValueInReport(cssTestKey, backgroundColor)
  }
  linkElm.setAttribute('href', styleSheetRequestUrl)
  document.head.appendChild(linkElm)

  import('./fpjs4.js')
    .then(FingerprintJS => FingerprintJS.load())
    .then(fp => fp.get())
    .then(result => {
      setValueInReport(fingerprintTestKey, result.visitorId)
    })
})()
