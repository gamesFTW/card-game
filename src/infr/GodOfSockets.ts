import chalk from 'chalk';

import * as koaSocketIO from 'socket.io';
import * as koaIO from 'koa-socket-2';
import * as Koa from 'koa';

import { Player } from '../domain/player/Player';
import { Event } from './Event';
import { EntityId } from './Entity';

class GodOfSockets {
  public userToSocket: Map<EntityId, koaSocketIO.Socket>;
  private socketToUser: WeakMap<koaSocketIO.Socket, EntityId>;
  private koaSocketIO: koaIO;

  constructor () {
    this.userToSocket = new Map();
    this.socketToUser = new WeakMap();
  }

  public autoRegistrateUsers (koaSocketIO: koaIO): void {
    this.koaSocketIO = koaSocketIO;

    koaSocketIO.on('register', (ctx, data) => {
      let playerId = data.playerId as EntityId;
      let gameId = data.playerId as EntityId;
      if (!playerId || !gameId) {
        console.error(chalk.red('playerId|gameId must be set'));
        // throw new Error('PlayerId must be set');
      } else {
        this.socketToUser.set(ctx.socket, playerId);
        this.userToSocket.set(playerId, ctx.socket);

        console.info(chalk.yellow(`player ${playerId} is registred`));
      }
    });

    koaSocketIO.on('disconnect', (ctx, data) => {
      let playerId = this.socketToUser.get(ctx.socket);
      if (!playerId) {
        console.info(chalk.yellow('Socket without registration is disconnected'));
      } else {
        this.userToSocket.delete(playerId);
        console.info(chalk.yellow(`User ${playerId} disconnected`));
      }
    });
  }

  public sendEventsInGame (gameId: EntityId, playerId: EntityId, events: Array<Event>): void {
    // let socket = this.userToSocket.get(playerId);

    // if (!socket) {
    //   console.info(chalk.yellow(`Player ${playerId} is not connected`));
    // } else {
    //   socket.emit('event', events);
    //   socket.broadcast.to(gameId).emit('event', events);
    // }

    // console.log();
    // this.koaSocketIO.broadcast('event', events);
    this.koaSocketIO.socket.of('/' + gameId).emit('event', events);
      // if (error) throw error;
      // console.log('out clients', clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
    // });
    // console.log('rooms:', this.koaSocketIO.socket.rooms);
    // console.log(this.koaSocketIO.socket);
    // TODO: всё это не работает. Решили переписать на express.
    // this.koaSocketIO.socket.sockets.to(gameId).emit('event', events);
    // this.koaSocketIO.to(gameId).emit('event', events);
  }
}
interface KoaWithSocketIo extends Koa {
  _io: SocketIO.Server;
}

// Register new namespace for game
const registerGameNamespace = (gameId: EntityId, app: KoaWithSocketIo) => {
  app._io.of('/' + gameId);
};



const godOfSockets = new GodOfSockets();
export { godOfSockets, registerGameNamespace, KoaWithSocketIo };
