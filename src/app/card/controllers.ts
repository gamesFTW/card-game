import * as Router from 'koa-router';

import {db} from "../../infr/DataBase";
import {CardUseCases} from "./CardUseCases";
import { Point } from '../../infr/Point';

const router = new Router();


// router.get('/createNewGame', async (ctx) => {
//   CardUseCases.createCard('orc', 10);
//   CardUseCases.createCard('elf', 8);
//
//   // TableUseCases.createCard(name, hp);
//
//   ctx.body = db;
// });


router.get('/createCard', async (ctx) => {
  let name = ctx.query.name;
  let hp = Number(ctx.query.hp);
  let x = Number(ctx.query.x);
  let y = Number(ctx.query.y);
  let point = new Point(x, y);

  CardUseCases.createCard(name, hp, point);

  ctx.body = db;
});

router.get('/getCards', async (ctx) => {
  ctx.body = CardUseCases.getCards();
});

router.get('/cardTookDamage', async (ctx) => {
  let cardId = ctx.query.id;
  let damage = Number(ctx.query.damage);

  CardUseCases.cardTookDamage(cardId, damage);

  ctx.body = CardUseCases.getCard(cardId);
});

router.get('/cardMove', async (ctx) => {
  let cardId = ctx.query.id;
  let x = Number(ctx.query.x);
  let y = Number(ctx.query.y);
  let point = new Point(x, y);

  CardUseCases.moveCard(cardId, point);

  ctx.body = 'ok';
});

router.get('/cardAttack', async (ctx) => {
  let attackingCardId = ctx.query.attackingCardId;
  let defendingCardId = ctx.query.defendingCardId;

  CardUseCases.cardAttack(attackingCardId, defendingCardId);

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
