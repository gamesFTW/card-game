import * as Router from 'koa-router';

const router = new Router();

router.get('/a', async (ctx) => {
    ctx.body = 'a';
});

export default router;
