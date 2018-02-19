import {Card} from "../../domain/card/Card";
import {CardRepository} from "../../infr/card/CardRepository";
import {EntityId} from "../../infr/Entity";
import {CardDied} from "../../domain/card/CardEvents";

let CardUseCases = {
  getCard(cardId: EntityId): Card {
    return CardRepository.get(cardId);
  },

  getCards(): Card[] {
    return CardRepository.getAll();
  },

  createCard(name: string, hp: number): EntityId {
    let card: Card = new Card();
    card.init(name, hp);

    CardRepository.save(card);

    return card.state.id;
  },

  cardTookDamage(cardId: EntityId, damage: number) {
    let card: Card = CardRepository.get(cardId);
    card.takeDamage(damage);

    CardRepository.save(card);

    return card;
  }
};

export {CardUseCases};
