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

  getCards (): Card[] {
    return CardRepository.getAll();
  },

  createCard (name: string, hp: number, point: Point): EntityId {
    let card: Card = new Card();
    card.init(name, hp);

    let field = FieldRepository.get();

    field.addCardToField(card, point);

    FieldRepository.save(field);
    CardRepository.save(card);

    return card.state.id;
  },

  cardTookDamage (cardId: EntityId, damage: number) {
    let card: Card = CardRepository.get(cardId);
    card.takeDamage(damage);

    CardRepository.save(card);

    return card;
  },

  moveCard (cardId: EntityId, point: Point) {
    let card: Card = CardRepository.get(cardId);

    return card;
  }
};

export {CardUseCases};
