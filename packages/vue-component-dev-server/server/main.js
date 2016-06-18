const PORT = parseInt(process.env.VUE_DEV_SERVER_PORT) || 3003;

// Client-side config
WebAppInternals.addStaticJs(`
  window.__hot_port__ = ${PORT};
`);
