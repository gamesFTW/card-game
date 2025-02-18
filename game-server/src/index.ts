import chalk from 'chalk';

import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as IO from 'koa-socket-2';
import * as cors from 'koa2-cors';

import { eventStore } from './infr/eventStore';

import { godOfSockets } from './infr/GodOfSockets';
import { lobbyService } from './app/lobbyService';
import config from './config';
import { gameController } from './http/gameController/gameController';
import { playerController } from './http/playerController';
import { debugController } from './http/_debug/debugController';
import { StaticContorller } from './http/staticController';
import { DomainError } from './infr/DomainError';
import { LobbyUseCasas } from './lobby/LobbyUseCases';
import { LobbyRepository } from './lobby/LobbyRepository';
import { LobbyController } from './lobby/LobbyController';
import { MatchMaker } from './lobby/MatchMaker';

let DEBUG = true;

async function main (): Promise<void> {
  await eventStore.on('connect');

  const app = new Koa();

  app.use(cors());

  // app.use(koaStatic(path.join(__dirname, 'static')));

  app.use(bodyParser());

  const wsIO = new IO();
  wsIO.attach(app, false);


  app.use(async (ctx: any, next: any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    DEBUG && console.log(chalk.green(`[${ctx.method}] ${ctx.url} - ${ms}ms`));
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      DEBUG && console.error(chalk.red(error.stack));

      if (error instanceof DomainError) {
        ctx.status = 500;
      } else {
        ctx.status = 520;
      }
      ctx.body = `${error.message}`;
    }
  });
  
  const lobbyRepository = new LobbyRepository();
  await lobbyRepository.init();

  const lobbyUseCasas = new LobbyUseCasas(lobbyRepository);
  const staticContorller = new StaticContorller(lobbyRepository);
  const matchMaker = new MatchMaker(lobbyUseCasas);
  const lobbyController = new LobbyController(lobbyRepository, lobbyUseCasas, matchMaker);

  godOfSockets.autoRegistrateUsers(wsIO);
  // const gameIds = await lobbyService.getAllGames();
  // gameIds.forEach(id => godOfSockets.registerNamespace(id));

  app.use(gameController.routes());
  app.use(playerController.routes());
  app.use(debugController.routes());
  app.use(staticContorller.router.routes());
  app.use(lobbyController.router.routes());

  app.use(gameController.allowedMethods());
  app.use(playerController.allowedMethods());
  app.use(debugController.allowedMethods());
  app.use(staticContorller.router.allowedMethods());
  app.use(lobbyController.router.allowedMethods());

  app.listen(3000);
  console.log('Server listen on ' + config.GAME_URL);
}

main();
