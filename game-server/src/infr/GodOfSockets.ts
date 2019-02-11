import chalk from 'chalk';

import * as koaSocketIO from 'socket.io';
import * as koaIO from 'koa-socket-2';
import * as Koa from 'koa';

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

  public registerNamespace (namespace: String): void {
    this.koaSocketIO.socket.of('/' + namespace);
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

  public sendActions (gameId: EntityId, clientEvents: Array<any>): void {
    this.koaSocketIO.socket.of('/' + gameId).emit('event', clientEvents);
  }

  public sendEventsInGame (gameId: EntityId, playerId: EntityId, clientEvents: Array<any>): void {
    // deprecated
  }
}
interface KoaWithSocketIo extends Koa {
  _io: SocketIO.Server;
}

// Register new namespace for game

const godOfSockets = new GodOfSockets();
export { godOfSockets, KoaWithSocketIo };
