import { Card } from './Card';
import { EntityId } from '../../infr/Entity';

function getCardsByIds (cards: Card[], ids: EntityId[]): Card[] {
  let foundCards = [];
  for (let card of cards) {
    for (let id of ids) {
      if (card.id === id) {
        foundCards.push(card);
      }
    }
  }

  return foundCards;
}

export {getCardsByIds};
