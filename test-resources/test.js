(async () => {
  const pageUrl = new URL(window.location)
  const context = JSON.parse(pageUrl.search)

  const report = {
    'image dimensions': null,
    'cookie value': null,
    fingerprint: null,
    'content filtering': null
  }

  // Host1 makes a same site request; host2 makes a cross site checks
  const shouldDoSameSiteRequest = (pageUrl.hostname === context.host1)
  const imgRequestUrl = shouldDoSameSiteRequest
    ? '/image.png'
    : `//${context.host1}/image.png`

  const imgElm = document.createElement('img')
  imgElm.onload = async _ => {
    report['image dimensions'] = JSON.stringify({
      height: imgElm.height,
      width: imgElm.width
    })

    // Send the report here
    await fetch('/report?' + encodeURIComponent(JSON.stringify(report)))
  }
  imgElm.src = imgRequestUrl
  document.body.appendChild(imgElm)
})()
