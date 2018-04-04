import * as Koa from 'koa';

import { eventStore } from './infr/eventStore';
import { cardController } from './app/card/cardController';
import { gameController } from './app/game/gameController';

async function main () {
  await eventStore.on('connect');

  const app = new Koa();

  app.use(async (ctx: any, next: any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });

  app.use(cardController.routes());
  app.use(gameController.routes());

  app.use(cardController.allowedMethods());
  app.use(gameController.allowedMethods());

  app.listen(3000);
}

main();
