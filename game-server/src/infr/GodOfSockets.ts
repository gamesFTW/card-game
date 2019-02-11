import chalk from 'chalk';

import * as net from 'net';
import { Event } from './Event';
import { EntityId } from './Entity';

// const server = net.createServer((socket) => {
//   socket.write('heloo\n', "utf-8");
// }).on('error', (err) => {
//   console.error(err);
// });

// // grab an arbitrary unused port.
// server.listen({
//     host: 'localhost',
//     port: 3000,
//   },
//   () => {
//     console.log('opened server on', server.address());
//   }
// );

class GodOfSockets {
  public userToSocket: Map<EntityId, net.Socket>;
  private socketToUser: WeakMap<net.Socket, EntityId>;
  private socketServer: net.Server;

  constructor () {
    this.userToSocket = new Map();
    this.socketToUser = new WeakMap();
    this.socketServer = net.createServer();
    // TODO добавить возможность поменять из env
    this.socketServer.listen({
      host: 'localhost',
      port: 3002
    });

    this.socketServer.addListener('connection', (socket: net.Socket) => {
      console.log('player connected');
      this.addPlayerSocket('1', socket);
      // socket.write(JSON.stringify({type: "Hello"}), 'utf-8');

      socket.on('error', (err: Error) => {
        console.error(err);
      });

      socket.on('close', (hadError: boolean) => {
        console.log('player disconnected');
        this.removeSocket(socket);
      });

      socket.on('data', (dataBuffer: Buffer) => {
        const data = dataBuffer.toString('utf-8');
        //this.addPlayerSocket(playerId, socket);

        console.log('<<', data);
      });
    });
  }

  public sendActions (gameId: EntityId, clientEvents: Array<any>): void {
    console.log('Send Data to players');

    let sendingData = {actions: clientEvents};
    const data = JSON.stringify(sendingData);
    this.userToSocket.forEach((socket, playerId) => {
      socket.write(data, 'utf-8');
      console.info(chalk.green(`${playerId} << ${data}`));
    });
  }

  public sendEventsInGame (gameId: EntityId, PlayerId: EntityId, clientEvents: Array<any>): void {
    //console.log
  }

  private addPlayerSocket (playerId: EntityId, socket: net.Socket): void {
    this.userToSocket.set(playerId, socket);
    console.info(chalk.yellow(`player ${playerId} is registred`));
  }

  private removeSocket (socket: net.Socket): void {
    this.userToSocket.forEach((currentSocket, playerId) => {
      if (socket === currentSocket) {
        this.userToSocket.delete(playerId);
        console.info(chalk.yellow(`User ${playerId} disconnected`));
      }
    });
  }

  // public autoRegistrateUsers (koaSocketIO: koaIO): void {

  //   koaSocketIO.on('register', (ctx, data) => {
  //     let playerId = data.playerId as EntityId;
  //     let gameId = data.playerId as EntityId;
  //     if (!playerId || !gameId) {
  //       console.error(chalk.red('playerId|gameId must be set'));
  //       // throw new Error('PlayerId must be set');
  //     } else {
  //       this.socketToUser.set(ctx.socket, playerId);
  //       this.userToSocket.set(playerId, ctx.socket);

  //       console.info(chalk.yellow(`player ${playerId} is registred`));
  //     }
  //   });

  //   koaSocketIO.on('disconnect', (ctx, data) => {
  //     let playerId = this.socketToUser.get(ctx.socket);
  //     if (!playerId) {
  //       console.info(chalk.yellow('Socket without registration is disconnected'));
  //     } else {
  //       this.userToSocket.delete(playerId);
  //       console.info(chalk.yellow(`User ${playerId} disconnected`));
  //     }
  //   });
  // }
}

const godOfSockets = new GodOfSockets();
export { godOfSockets };
