let self
const port = 3100
const server = 'http://localhost:' + port
const testOrigin = "http://" + '/test'
const testServer = server + '/test'
const GlobalConfig = {
  port: port,
  server: server,
  testServer: testServer
}

module.exports = GlobalConfig

