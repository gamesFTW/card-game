import chalk from 'chalk';
import * as koaSocketIO from 'socket.io';
import * as koaIO from 'koa-socket-2';
import * as Koa from 'koa';

import { EntityId } from './Entity';

class GodOfSockets {
  public userToSocket: Map<EntityId, koaSocketIO.Socket>;
  private socketToUser: WeakMap<koaSocketIO.Socket, EntityId>;
  private gameIdToSockets: Map<EntityId, koaSocketIO.Socket[]>;
  private koaSocketIO: koaIO;

  constructor () {
    this.userToSocket = new Map();
    this.socketToUser = new WeakMap();
    this.gameIdToSockets = new Map();
  }

  public registerNamespace = (namespace: String) => {
    this.koaSocketIO.socket.of('/' + namespace);
  }

  public autoRegistrateUsers (koaSocketIO: koaIO): void {
    this.koaSocketIO = koaSocketIO;

    // koaSocketIO.on('beep', (ctx_, data) => {
    //   console.info(chalk.yellow(`Beep to boop`));
    //   console.log('aaaa', ctx_, data);
    //   ctx_.socket.emit('boop');
    // });

    koaSocketIO.on('connection', (ctx, data) => {
      console.info(chalk.yellow(`Sombody connected ${data}`));

      ctx.socket.on('register', (data) => {
        let playerId = data.playerId as EntityId;
        let gameId = data.gameId as EntityId;
        if (!playerId || !gameId) {
          console.error(chalk.red('playerId & gameId must be set'));
          return;
          // throw new Error('PlayerId must be set');
        }

        this.socketToUser.set(ctx.socket, playerId);
        this.userToSocket.set(playerId, ctx.socket);

        if (!this.gameIdToSockets.get(gameId)) {
          this.gameIdToSockets.set(gameId, []);
        }
        this.gameIdToSockets.get(gameId).push(ctx.socket);

        console.info(chalk.yellow(`player ${playerId} is registred`));
      });
    });

    koaSocketIO.on('disconnect', (ctx, data) => {
      let playerId = this.socketToUser.get(ctx.socket);
      if (!playerId) {
        console.info(chalk.yellow('Socket without registration is disconnected'));
      } else {
        this.userToSocket.delete(playerId);
        // TODO delete from this.gameIdToSockets.get(gameId)
        console.info(chalk.yellow(`User ${playerId} disconnected`));
      }
    });
  }

  public sendActions (gameId: EntityId, clientEvents: Array<any>): void {
    // namespace now not supported
    // this.koaSocketIO.socket.of('/' + gameId).emit('event', clientEvents);

    if (this.gameIdToSockets.get(gameId)) {
      this.gameIdToSockets.get(gameId).forEach(socket => {
        const playerId = this.socketToUser.get(socket);
        console.info(chalk.yellow(`${playerId} <<< ${JSON.stringify(clientEvents)}`));
        socket.emit('event', {actions: clientEvents});
      });
    }
  }
}
interface KoaWithSocketIo extends Koa {
  _io: SocketIO.Server;
}

// Register new namespace for game
// TODO REMOVE NAMESPACES CUZ OF UNITY LIB DOES NOT SUPPORT IT

const godOfSockets = new GodOfSockets();
export { godOfSockets, KoaWithSocketIo };
