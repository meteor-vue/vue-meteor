function getMeteorPort() {
  const reg = /:\/\/.+:(\d+)/gi;
  const result = reg.exec(Meteor.absoluteUrl());
  if(result.length >= 2) {
    return parseInt(result[1]) + 3;
  }
}

const PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || getMeteorPort() || 3003;

// Client-side config
__meteor_runtime_config__.VUE_DEV_SERVER_PORT = PORT;
