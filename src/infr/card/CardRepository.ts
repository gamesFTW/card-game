import {Card} from "../../domain/card/Card";
import {Event} from "../Event";
import {db} from "../DataBase";
import {EntityId} from "../Entity";

let CardRepository = {
  save (card: Card): void {
    card.changes.forEach((event: Event) => {
      let cardId = event.data.id;
      db.cards[cardId] = db.cards[cardId] ? db.cards[cardId] : [];

      let cardEvents = db.cards[cardId];
      cardEvents.push(event);
    });

    card.changes = [];

    db.save();
  },
  get (id: EntityId): Card {
    let cardEvents = db.cards[id];
    return new Card(cardEvents);
  },
  getAll (): Array<Card> {
    let cards = [];

    for (let cardId in db.cards) {
      let cardEvents = db.cards[cardId];
      let card: Card = new Card(cardEvents);

      cards.push(card);
    }

    return cards;
  }
};

export {CardRepository};
