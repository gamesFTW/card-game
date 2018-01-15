import * as Router from 'koa-router';
import {Game} from "../domain/Game";
import {Point} from "../domain/Point";
import {Card} from "../domain/Card";
import {Field} from "../domain/Field";
import {Event} from "../domain/Card";

const router = new Router();

// let game: Game = new Game();

let cardDB: Array<Event> = [];

router.get('/createCard', async (ctx) => {
  let name = ctx.query.name;

  let card: Card = new Card([]);
  card.init(name);

  cardDB = cardDB.concat(card.changes);

  console.log(cardDB);

  ctx.body = cardDB;
});

router.get('/getCards', async (ctx) => {
  cardDB.forEach(event => {
    let card: Card = new Card([event]);
    console.log(card.state.name);
  });

  ctx.body = 'ok';
});


// router.get('/moveCard', async (ctx) => {
//   ctx.body = 'ok';
//
//   let cardId = ctx.cardId;
//   let toX = ctx.toX;
//   let toY = ctx.toY;
//
//   let card: Card = CardRepo.getById(cardId);
//   let field: Field = FieldRepo.get();
//
//   let toPoint = new Point(toX, toY);
//
//   field.move(card, toPoint);
//
//   FieldRepo.update(field);
// });
//
//
// router.get('/attackCard', async (ctx) => {
//   ctx.body = 'ok';
//
//   let attackingCardId = ctx.attackingCardId;
//   let attackedCardId = ctx.attackedCardId;
//
//   let attackingCard: Card = CardRepo.getById(attackingCardId);
//   let attackedCard: Card = CardRepo.getById(attackedCardId);
//
//   let isAdjacent = field.isCardAdjacent(attackingCard, attackedCard);
//   if (isAdjacent) {
//     let damage = attackingCard.calcDamage(attackedCard);
//     attackedCard.takeDamage(damage);
//   } else {
//     throw new Error();
//   }
//
//   CardRepo.update(attackedCard); // берём все changes и кладём в базу
// });
//
// router.get('/getPlayerHand', async (ctx) => {
//   ctx.body = 'ok';
//
//   let playerId = ctx.playerId;
//
//   let player: Player = PlayerRepo.getById(playerId);
//   let cardsId = player.cardsId;
//
//   cardsId.forEach(cardId, )
//
// });

export default router;
