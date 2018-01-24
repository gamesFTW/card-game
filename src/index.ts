import * as Koa from 'koa';

import appRouters from './app/card/controllers';

const app = new Koa();

app.use(async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(appRouters.routes());
app.use(appRouters.allowedMethods());

app.listen(3000);
