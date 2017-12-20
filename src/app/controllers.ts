import * as Router from 'koa-router';
import {Game} from "../domain/Game";


const router = new Router();

let game: Game = new Game();

router.get('/showAllCards', async (ctx) => {
  ctx.body = 'ok';

  game.showAllCards();
});

export default router;
