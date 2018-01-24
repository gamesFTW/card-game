import {Card} from "../../domain/card/Card";
import {CardRepository} from "../../infr/card/CardRepository";

let CardUseCases = {
  getCards(): Card[] {
    return CardRepository.getAll();
  },

  getCard(cardId: string): Card {
    return CardRepository.get(cardId);
  },

  createCard(name: string, hp: number) {
    let card: Card = new Card([]);
    card.init(name, hp);

    CardRepository.save(card);
  },

  cardTookDamage(cardId: string, damage: number) {
    let card: Card = CardRepository.get(cardId);
    card.takeDamage(damage);

    CardRepository.save(card);

    return card;
  }
};

export {CardUseCases};