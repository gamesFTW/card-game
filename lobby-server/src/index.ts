import chalk from 'chalk';

import * as Koa from 'koa';

import * as bodyParser from 'koa-bodyparser';
import * as cors from 'koa2-cors';
import * as koaStatic from 'koa-static';
import { controller } from './controller';
import { connectToDb } from './db/db';
import { mq, registerMQ } from './mq/mq';
import { GameEventType } from '../../game-server/src/domain/events';
import { GameModel, GameStatus } from './db/db';
import { Event } from '../../game-server/src/infr/Event';

async function main (): Promise<void> {
  await registerMQ();
  mq.subscribe(GameEventType.GAME_CREATED, async (event: Event) => {
    const game = new GameModel({ gameId: event.data.id, status: GameStatus.NEW });
    await game.save();
  });

  connectToDb();

  const app = new Koa();

  app.use(cors());

  // app.use(koaStatic(path.join(__dirname, 'static')));

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

  app.use(controller.routes());

  app.use(controller.allowedMethods());

  console.log('Server listen on 3001 http://localhost:3001');
  app.listen(3001);
}

main();
