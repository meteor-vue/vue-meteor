import localIp from 'local-ipv4-address'

function getMeteorPort() {
  const reg = /:\/\/.+:(\d+)/gi;
  const result = reg.exec(Meteor.absoluteUrl());
  if(result && result.length >= 2) {
    return parseInt(result[1]) + 3;
  }
}

const localIpSync = Meteor.wrapAsync(cb => {
  localIp().then(result => {
    cb(null, result)
  }).catch(error => {
    cb(error)
  })
})

// to define only dev port with same url
const PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || getMeteorPort() || 3003;

// to define full url with port (example: https://dev.example.com:8443) or only domain
const DEVURL = process.env.HMR_URL || process.env.VUE_DEV_SERVER_URL || localIpSync();


// Client-side config
__meteor_runtime_config__.VUE_DEV_SERVER_URL = DEVURL.indexOf(':') === -1 ? `${DEVURL}:${PORT}` : DEVURL;
