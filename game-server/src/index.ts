import * as path from 'path';

import chalk from 'chalk';

import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as IO from 'koa-socket-2';
import * as cors from 'koa2-cors';
import * as koaStatic from 'koa-static';

import { mqMain } from './infr/mq/mq';
mqMain();

import { Lobby } from '../../lobby-server/Lobby';
const lobby = Lobby.getInstance();

import { eventStore } from './infr/eventStore';
import { cardController } from './app/card/cardController';
import { gameController } from './app/game/gameController';
import { playerController } from './app/player/playerController';
import { staticContorller } from './app/static/StaticController';
import { debugController } from './app/_debug/debugController';

import { godOfSockets } from './infr/GodOfSockets';

async function main (): Promise<void> {
  await eventStore.on('connect');

  const app = new Koa();

  app.use(cors());

  app.use(koaStatic(path.join(__dirname, 'static')));

  const wsIO = new IO();
  wsIO.attach(app, false);

  app.use(bodyParser());

  app.use(async (ctx: any, next: any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(chalk.green(`${ctx.method} ${ctx.url} - ${ms}ms`));
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error(chalk.red(error.stack));

      ctx.status = 500;
      ctx.body = `${error.stack}`;
    }
  });

  wsIO.use(async (ctx, next ) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(chalk.yellow(`WS: ${ctx.event} - ${ms}ms`));
  });

  godOfSockets.autoRegistrateUsers(wsIO);
  const gameIds = await lobby.getAllGameIds();
  gameIds.forEach(id => godOfSockets.registerNamespace(id));

  app.use(cardController.routes());
  app.use(gameController.routes());
  app.use(playerController.routes());
  app.use(debugController.routes());
  app.use(staticContorller.routes());

  app.use(cardController.allowedMethods());
  app.use(gameController.allowedMethods());
  app.use(playerController.allowedMethods());
  app.use(debugController.allowedMethods());
  app.use(staticContorller.allowedMethods());

  console.log('Server listen on 3000 http://localhost:3000');
  app.listen(3000);
}

main();
