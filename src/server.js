const app = require('./app');
const http = require('http');
const { init } = require('./utils/socket');
const port = process.env.PORT || 3000;

const server = http.createServer(app);
init(server);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
