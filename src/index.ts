import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as IO from 'koa-socket-2';

import { eventStore } from './infr/eventStore';
import { cardController } from './app/card/cardController';
import { gameController } from './app/game/gameController';
import { playerController } from './app/player/playerController';
import { staticContorller } from './app/static/StaticController';
import { debugController } from './app/_debug/debugController';

async function main (): Promise<void> {
  await eventStore.on('connect');

  const app = new Koa()
  const wsIO = new IO();
  wsIO.attach(app, false);

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

  wsIO.on('message', (ctx, data) => {
    console.log('context', ctx);
    console.log('client sent data to message endpoint', data);
    ctx.socket.emit('message', 'hi');
  });

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
