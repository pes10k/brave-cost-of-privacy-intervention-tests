export const makeLogger = (isVerbose = true) => {
  if (!isVerbose) {
    return () => {}
  }

  return (msg) => {
    if (typeof msg === 'string') {
      console.log(msg)
    } else {
      console.log(JSON.stringify(msg))
    }
  }
}
