import * as path from 'path';

import chalk from 'chalk';

import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as IO from 'koa-socket-2';
import * as cors from 'koa2-cors';
import * as koaStatic from 'koa-static';

import { eventStore } from './infr/eventStore';

import { godOfSockets } from './infr/GodOfSockets';
import { lobbyService } from './app/lobbyService';
import config from './config';
import { gameController } from './http/gameController/gameController';
import { playerController } from './http/playerController';
import { debugController } from './http/_debug/debugController';
import { staticContorller } from './http/staticController';
import { DomainError } from './infr/DomainError';

async function main (): Promise<void> {
  await eventStore.on('connect');

  const app = new Koa();

  app.use(cors());

  app.use(koaStatic(path.join(__dirname, 'static')));

  app.use(bodyParser());

  const wsIO = new IO();
  wsIO.attach(app, false);


  app.use(async (ctx: any, next: any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(chalk.green(`[${ctx.method}] ${ctx.url} - ${ms}ms`));
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error(chalk.red(error.stack));

      if (error instanceof DomainError) {
        ctx.status = 500;
      } else {
        ctx.status = 520;
      }
      ctx.body = `${error.message}`;
    }
  });
  

  godOfSockets.autoRegistrateUsers(wsIO);
  const gameIds = await lobbyService.getAllGames();
  gameIds.forEach(id => godOfSockets.registerNamespace(id));

  app.use(gameController.routes());
  app.use(playerController.routes());
  app.use(debugController.routes());
  app.use(staticContorller.routes());

  app.use(gameController.allowedMethods());
  app.use(playerController.allowedMethods());
  app.use(debugController.allowedMethods());
  app.use(staticContorller.allowedMethods());

  console.log('Server listen on ' + config.GAME_URL);
  app.listen(3000);
}

main();
