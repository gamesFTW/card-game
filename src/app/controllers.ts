import * as Router from 'koa-router';
import {Game} from "../domain/Game";
import {Point} from "../domain/Point";
import {Card} from "../domain/Card";
import {Field} from "../domain/Field";
import {Event} from "../domain/Card";

const router = new Router();

// let game: Game = new Game();

class DataBase {
  public cards: {[s: string]: Array<Event>} = {};
}

let db: DataBase = new DataBase();


let cardRepository = {
  save: (card: Card) => {
    card.changes.forEach((event: Event) => {
      let cardId = event.data.id;
      db.cards[cardId] = db.cards[cardId] ? db.cards[cardId] : [];

      let cardEvents = db.cards[cardId];
      cardEvents.push(event);
    });

    card.changes = [];
  },
  get: (id: string) => {
    let cardEvents = db.cards[id];
    return new Card(cardEvents);
  },
  getAll: () => {
    let cards = [];
    for (let cardId in db.cards) {
      let cardEvents = db.cards[cardId];
      let card: Card = new Card(cardEvents);

      cards.push(card);
    }

    return cards;
  }
};

router.get('/createCard', async (ctx) => {
  let name = ctx.query.name;
  let hp = Number(ctx.query.hp);

  let card: Card = new Card([]);
  card.init(name, hp);

  cardRepository.save(card);

  ctx.body = db;
});

router.get('/getCards', async (ctx) => {
  let cards: Card[] = cardRepository.getAll();

  ctx.body = cards;
});

router.get('/cardTookDamage', async (ctx) => {
  let cardId = ctx.query.id;
  let damage = Number(ctx.query.damage);

  let card: Card = cardRepository.get(cardId);
  card.takeDamage(damage);

  cardRepository.save(card);

  ctx.body = card;
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
