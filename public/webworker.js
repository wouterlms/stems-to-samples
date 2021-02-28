const onMessageReceive = (e) => {
  console.log(`Worker received a message`, e)
  // const res = heavyProcessing()
  const res = ''
  self.postMessage(res)
}

this.addEventListener('message', onMessageReceive)
