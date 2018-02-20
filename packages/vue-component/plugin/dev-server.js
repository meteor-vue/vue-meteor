import http from 'http'
import SocketIo from 'socket.io'
import {Meteor} from 'meteor/meteor'

function getMeteorBinding () {
  const argv = this.process.argv
  if (Array.isArray(argv)) {
    const index = argv.findIndex(
      arg => arg.indexOf('-p') === 0 || arg.indexOf('--port') === 0
    )
    if (index !== -1) {
      const arg = argv[index]
      const equalIndex = arg.indexOf('=')
      let value
      if (equalIndex !== -1) {
        value = arg.substr(equalIndex + 1)
      } else {
        value = argv[index + 1]
      }
      const results = value.split(':')
      let networkInterface
      let port
      if (results.length === 2) {
        networkInterface = results[0]
        port = results[1]
      } else {
        port = results[0]
      }
      return {
        networkInterface,
        port: parseInt(port),
      }
    }
  } else {
    const reg = /(?:--port|-p)(?:=|\s)(?:([0-9.]+):)?(\d+)/gi
    const result = reg.exec(argv)
    if (result && result.length >= 2) {
      const networkInterface = result[1]
      const port = parseInt(result[2])
      return {
        networkInterface,
        port,
      }
    }
  }
  return {}
}

if (global._dev_server_http) {
  global._dev_server.close()
  global._dev_server_http.close()
  delete global._dev_server
  delete global._dev_server_http
}

if (Meteor.isDevelopment) {
  var server = http.createServer()
  var io = SocketIo(server, {
    serveClient: false,
  })

  // Stored dynamic styles
  io.__styles = {}
  io.__addStyle = function ({hash, css, path}, emit = true) {
    if (emit) {
      io.emit('css', { hash, css, path })
    }
    io.__styles[hash] = {
      hash,
      css,
      path,
    }
  }

  // Send all stored dynamic styles to new clients
  io.on('connection', function (socket) {
    for (var hash in io.__styles) {
      socket.emit('css', io.__styles[hash])
    }
  })

  const binding = getMeteorBinding()
  PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || binding.port + 3 || 3003
  INTERFACE = binding.networkInterface

  try {
    let status
    if (INTERFACE) {
      server.listen(PORT, INTERFACE)
      status = `${INTERFACE}:${PORT}`
    } else {
      server.listen(PORT)
      status = `port ${PORT}`
    }
    if (process.stdout.clearLine) {
      process.stdout.clearLine()
    }
    process.stdout.write(`\r=> [HMR] Dev server listening on ${status}.\n`)
    global._dev_server = io
    global._dev_server_http = server
  } catch (e) {
    console.log(e)
  }
}
