import * as Koa from 'koa';
import * as Router from 'koa-router';

import appRouters from './app/controllers';


const app = new Koa();
const router = new Router();

app.use(async (ctx: any, next:any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx: Koa.Context, next) => {
    ctx.body = 'hello';
    await next();
});


app.use(router.routes());

app.use(appRouters.routes());
app.use(router.allowedMethods());

app.listen(3000);
