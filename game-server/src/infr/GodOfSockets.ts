import chalk from 'chalk';
// import * as koaSocketIO from 'socket.io';
// import * as Koa from 'koa';

import { Server, Socket } from 'socket.io';
import WebSocket, { WebSocketServer } from 'ws';

import { EntityId } from './Entity';

class GodOfSockets {
  public userToSocket: Map<EntityId, WebSocket>;
  private socketToUser: WeakMap<WebSocket, EntityId>;
  private gameIdToSockets: Map<EntityId, WebSocket[]>;
  private webSocketServer: WebSocketServer;

  constructor () {
    this.userToSocket = new Map();
    this.socketToUser = new WeakMap();
    this.gameIdToSockets = new Map();
  }

  public autoRegistrateUsers(webSocketServer: WebSocketServer): void {
    this.webSocketServer = webSocketServer;

    webSocketServer.on('connection', (webSocket: WebSocket) => {
      console.info(chalk.yellow(`A user connected`));

      webSocket.on('message', (message: string) => {
        console.log(`Received: ${message}`);
        
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'register') {
            let playerId = data.message.playerId as EntityId;
            let gameId = data.message.gameId as EntityId;
            console.info(chalk.yellow(`player ${playerId} want to register`));

            if (!playerId) {
              console.error(chalk.red('Error on socker register: playerId must be set'));
              return;
            }

            if (!gameId) {
              console.error(chalk.red('Error on socker register: gameId must be set'));
              return;
            }

            this.socketToUser.set(webSocket, playerId);
            this.userToSocket.set(playerId, webSocket);

            if (!this.gameIdToSockets.get(gameId)) {
              this.gameIdToSockets.set(gameId, []);
            }
            this.gameIdToSockets.get(gameId).push(webSocket);

            console.info(chalk.yellow(`player ${playerId} is registred`));
          }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    webSocket.on('close', (ws: WebSocket, code: number, reason: Buffer) => {
        let playerId = this.socketToUser.get(webSocket);
        if (!playerId) {
          console.info(chalk.yellow('Socket without registration is disconnected'));
        } else {
          this.userToSocket.delete(playerId);
          // TODO delete from this.gameIdToSockets.get(gameId)
          console.info(chalk.yellow(`User ${playerId} disconnected`));
        }
      });
    });
  }

  public sendActions (gameId: EntityId, clientEvents: Array<any>): void {
    console.info(chalk.yellow('Send event', JSON.stringify(clientEvents)));

    if (this.gameIdToSockets.get(gameId)) {
      this.gameIdToSockets.get(gameId).forEach((webSocket: WebSocket) => {
        webSocket.send(JSON.stringify({ actions: clientEvents }));
      });
    }
  }
}

const godOfSockets = new GodOfSockets();
export { godOfSockets };
