import * as net from 'net';

const server = net.createServer((socket) => {
  socket.write('heloo\n', "utf-8");
}).on('error', (err) => {
  console.error(err);
});

// grab an arbitrary unused port.
server.listen({
    host: 'localhost',
    port: 3000,
  },
  () => {
    console.log('opened server on', server.address());
  }
);
