import * as Router from 'koa-router';
import { Game } from '../../domain/game/Game';
import { Repository } from '../../infr/repositories/Repository';
import { EntityId } from '../../infr/Entity';
import { Player } from '../../domain/player/Player';
import { Card } from '../../domain/card/Card';

const playerController = new Router();

playerController.post('/playCardAsManna', async (ctx) => {
  let gameId = ctx.query.gameId as EntityId;
  let cardId = ctx.query.cardId as EntityId;
  let playerIdWhoWantDoAction = ctx.query.playerId as EntityId; // TODO: его нужно доставать из сессии

  // let game = await Repository.get<Game>(gameId, Game);
  // let currentPlayer = await Repository.get<Player>(game.currentPlayersTurn, Player);
  // let playerWhoWantDoAction = await Repository.get<Player>(playerIdWhoWantDoAction, Player);
  // let card = await Repository.get<Card>(cardId, Card);
  //
  // // TODISCUSS: На сколько омерзительно это делать тут.
  // let currentPlayerMannaPoolCards = await Repository.getMany <Card>(currentPlayer.mannaPool, Card);
  // let currentPlayerTableCards = await Repository.getMany <Card>(currentPlayer.table, Card);
  //
  // game.endTurn(currentPlayer, playerWhoWantFinishTurn, currentPlayerMannaPoolCards, currentPlayerTableCards);
  //
  // await Repository.save(game);
  // await Repository.save(currentPlayer);
  // await Repository.save(currentPlayerMannaPoolCards);
  // await Repository.save(currentPlayerTableCards);

  ctx.body = `Ok`;
});

export {playerController};
