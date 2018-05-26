import chalk from 'chalk';

import * as socketIO from 'socket.io';
import * as koaIO from 'koa-socket-2';

import { Player } from '../domain/player/Player';
import { Event, ClientEvent } from './Event';
import { EntityId } from './Entity';

class WSUserRegistry {
  public userToSocket: Map<EntityId, socketIO.Socket>
  private socketToUser: WeakMap<socketIO.Socket, EntityId>

  constructor() {
    this.userToSocket = new Map();
    this.socketToUser = new WeakMap();
  }

  public autoRegistrateUsers(wsIO: koaIO): void {
      wsIO.on('register', (ctx, data) => {
        let playerId = data.playerId as EntityId;
        if (!playerId) {
          console.error(chalk.red('playerId must be set'));
          // throw new Error('PlayerId must be set');
        } else {
          this.socketToUser.set(ctx.socket, playerId);
          this.userToSocket.set(playerId, ctx.socket); 
          console.log(chalk.yellow(`player ${playerId} is registred`));
        }
      });

      wsIO.on('disconnect', (ctx, data) => {
        let playerId = this.socketToUser.get(ctx.socket);
        if (!playerId) {
          console.info(chalk.yellow('Socket without registration is disconnected'));
        } else {
          this.userToSocket.delete(playerId); 
          console.log(chalk.yellow(`User ${playerId} disconnected`));
        }
      });
  }

  public sendEvents(playerId: EntityId, events: Array<ClientEvent>) {
    let socket = this.userToSocket.get(playerId);
        if (!socket) {
          console.log(chalk.yellow(`Player ${playerId} is not connected`));
        } else {
            socket.emit('event', events);
        }
  }
  
  
}
const wsUserRegistry = new WSUserRegistry();
export { wsUserRegistry };