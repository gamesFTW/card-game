import {Card} from "../../domain/card/Card";
import {CardRepository} from "../../infr/card/CardRepository";
import { FieldRepository } from "../../infr/FieldRepository";
import {EntityId, Entity} from "../../infr/Entity";
import { CardDied } from "../../domain/card/CardEvents";
import { Point } from '../../infr/Point';

let CardUseCases = {
  getCard (cardId: EntityId): Card {
    return CardRepository.get(cardId);
  },

  getCards (): Array<any> {
    let cards = CardRepository.getAll();
    let field = FieldRepository.get();
    let response: Array<any> = [];

    cards.forEach((card) => {
      let point = field.getPointByCard(card);

      response.push({
        id: card.id,
        name: card.name,
        hp: card.hp,
        alive: card.alive,
        x: point.x,
        y: point.y
      });
    });

    return response;
  },

  createCard (name: string, hp: number, point: Point): EntityId {
    let card: Card = new Card();
    card.init(name, hp);

    let field = FieldRepository.get();

    field.addCardToField(card, point);

    FieldRepository.save(field);
    CardRepository.save(card);

    return card.id;
  },

  cardTookDamage (cardId: EntityId, damage: number) {
    let card: Card = CardRepository.get(cardId);
    card.takeDamage(damage);

    CardRepository.save(card);

    return card;
  },

  moveCard (cardId: EntityId, point: Point) {
    let card = CardRepository.get(cardId);
    let field = FieldRepository.get();
    field.moveCardToPoint(card, point);

    FieldRepository.save(field);

    return card;
  },

  cardAttack (attackingCardId: EntityId, defendingCardId: EntityId) {
    let attackingCard = CardRepository.get(attackingCardId);
    let defendingCard = CardRepository.get(defendingCardId);

    let field = FieldRepository.get();

    let isCardsAdjacent = field.checkCardsAdjacency(attackingCard, defendingCard);
    console.log(isCardsAdjacent);

  }
};

export {CardUseCases};
