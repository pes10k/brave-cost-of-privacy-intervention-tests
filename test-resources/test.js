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
    console.log('setValueInReport', { key, value })
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

    const isDebug = pageUrl.searchParams.get('debug') === 'debug'

    if (isFirstTestPage) {
      const secondPageUrl = new URL(pageUrl)
      secondPageUrl.hostname = context.get('host2')

      const pElm = document.getElementsByTagName('p')[0]
      pElm.innerText = 'Test Complete. Next page is: '
      const aElm = document.createElement('a')
      aElm.href = secondPageUrl.toString()
      aElm.innerText = secondPageUrl.toString()
      pElm.appendChild(aElm)

      if (isDebug === false) {
        setTimeout(() => {
          console.log("(parent) about to navigate to " + secondPageUrl.toString())
          window.location = secondPageUrl.toString()
        }, 3000)
      }
    } else {
      if (isDebug === false) {
        // window.close()
      }
    }
  }

  window.addEventListener('message', async (event) => {
    console.log("RECEIVING: ", event.data)
    if (event.data.name !== 'response') {
      console.error('(parent) Unexpected message: ', event.data)
    }
    await setValueInReport(networkTestKey, event.data.image)
    await setValueInReport(cssTestKey, event.data.color)
    await setValueInReport(storageTestKey, event.data.storage || null)
  }, false)

  // Host1 makes a same site request; host2 makes a cross site checks
  const isFirstTestPage = (pageUrl.hostname === context.get('host1'))
  const firstSiteOriginURL = new URL(`${pageUrl.protocol}//${context.get('host1')}:${pageUrl.port}`)

  if (isFirstTestPage) {
    window.localStorage.value = String(Math.random())
  }

  const imageIFrameElm = document.createElement('iframe')
  const imageIFrameUrl = new URL(firstSiteOriginURL)
  imageIFrameUrl.pathname = '/iframe.html'
  imageIFrameElm.src = imageIFrameUrl.toString()
  document.body.appendChild(imageIFrameElm)
  setTimeout(() => {
    imageIFrameElm.contentWindow.postMessage({ name: 'read' }, '*')
    console.log("(parent) sent to child")
  }, 1000)

  import('./fpjs4.js')
    .then(FingerprintJS => FingerprintJS.load())
    .then(fp => fp.get())
    .then(result => {
      setValueInReport(fingerprintTestKey, result.visitorId)
    })
})()
