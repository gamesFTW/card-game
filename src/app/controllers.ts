import * as Router from 'koa-router';
import {Game} from "../domain/Game";


const router = new Router();

router.get('/a', async (ctx) => {
  ctx.body = 'a';
  let game: Game = new Game();
  game.showAllCards();
});

export default router;
