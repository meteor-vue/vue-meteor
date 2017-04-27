import os from 'os'

function getMeteorPort() {
  const reg = /:\/\/.+:(\d+)/gi
  const result = reg.exec(Meteor.absoluteUrl())
  if(result && result.length >= 2) {
    return parseInt(result[1]) + 3
  }
}

function getLocalIp () {
  const ifaces = os.networkInterfaces()

  let ip
  for (const key of Object.keys(ifaces)) {
    const interfaces = ifaces[key]
    for (const iface of interfaces) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      } else {
        ip = iface.address
        break
      }
    }
    if (ip) {
      break
    }
  }

  if (!ip) {
    console.warn(`[HMR] No local IP detected. If you want to connect from a remote device, set the local IP with the 'HMR_URL' env. variable.`)
    ip = '127.0.0.1'
  } else {
    // console.warn(`[HMR] Local IP detected: '${ip}'. If you have issues connecting from a remote device, set the local IP with the 'HMR_URL' env. variable.`)
  }

  return ip
}

const localIpSync = Meteor.wrapAsync(cb => {
  localIp().then(result => {
    cb(null, result)
  }).catch(error => {
    cb(error)
  })
})

// to define only dev port with same url
const PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || getMeteorPort() || 3003

// to define full url with port (example: https://dev.example.com:8443) or only domain
const DEVURL = process.env.HMR_URL || process.env.VUE_DEV_SERVER_URL || getLocalIp()


// Client-side config
__meteor_runtime_config__.VUE_DEV_SERVER_URL = `${DEVURL}:${PORT}`
