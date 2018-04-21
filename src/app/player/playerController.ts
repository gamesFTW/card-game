import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { Player } from '../../domain/player/Player';
import { Card } from '../../domain/card/Card';

const playerController = new Router();

playerController.post('/playCardAsManna', async (ctx) => {
  // TODO: его нужно доставать из сессии
  let playerId = ctx.query.playerId as EntityId;
  let cardId = ctx.query.cardId as EntityId;

  let player = await Repository.get<Player>(playerId, Player);
  let card = await Repository.get<Card>(cardId, Card);

  player.playCardAsManna(card);

  await Repository.save(player);
  await Repository.save(card);

  ctx.body = `Ok`;
});

export {playerController};
