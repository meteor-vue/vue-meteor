function getMeteorPort() {
  const reg = /:\/\/.+:(\d+)/gi;
  const result = reg.exec(Meteor.absoluteUrl());
  if(result && result.length >= 2) {
    return parseInt(result[1]) + 3;
  }
}

// to define full url with port (example: https://dev.example.com:8443/)
const DEVURL = process.env.HMR_URL || process.env.VUE_DEV_SERVER_URL || null;

// to define only dev port with same url
const PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || getMeteorPort() || 3003;

// Client-side config
__meteor_runtime_config__.VUE_DEV_SERVER_PORT = PORT;
__meteor_runtime_config__.VUE_DEV_SERVER_URL = DEVURL;
