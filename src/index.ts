import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';

import { eventStore } from './infr/eventStore';
import { cardController } from './app/card/cardController';
import { gameController } from './app/game/gameController';
import { playerController } from './app/player/playerController';
import { debugController } from './app/_debug/debugController';

async function main (): Promise<void> {
  await eventStore.on('connect');

  const app = new Koa();

  app.use(bodyParser());

  app.use(async (ctx: any, next: any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error(error.stack);

      ctx.status = 500;
      ctx.body = `${error.stack}`;
    }
  });

  app.use(cardController.routes());
  app.use(gameController.routes());
  app.use(playerController.routes());
  app.use(debugController.routes());

  app.use(cardController.allowedMethods());
  app.use(gameController.allowedMethods());
  app.use(playerController.allowedMethods());
  app.use(debugController.allowedMethods());

  app.listen(3000);
}

main();
