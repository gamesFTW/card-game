import {EntityId} from "../../infr/Entity";
import {CardDied} from "../card/CardEvents";
import {Card} from '../card/Card';

class CardsOnTable {
  //or Game, PlayersCards
}

class PlayerCards {
  // Player

  deckCards: Array<EntityId> = ['1', '2'];
  handCards: Array<EntityId> = [];

  // Deck methods
  draw() {
    // let topCardIdInDeck = this.deckCards[0];
    // this.apply(new CardDrawen({drawenCardId: topCardIdInDeck}));
  }

  shuffleDeck() {}

  // пример с абилкой посмотреть в деку и взять карту

  // Hand methods
  discard(cardId: EntityId) {}

  playCard(cardId: EntityId) {
    // важно проработать
  }

  playAsMana(card: Card) {
    if (card.tapped) {
      // бросаем ошибку
    } else {
      this.apply(new CardPlayedAsMana());
      card.tap();
    }
  }

  untapAll () {}


  // whenCardDrawen(event: CardDrawen) {
  //   // Можно сделать дополнительные проверки
  //   this.handCards.shift();
  //   this.handCards.push(event.data.drawenCardId);
  // }
}


// Deck
//   draw
// Hand
//   play
//   discard
// Table
//   moveToGraveyard
// Graveyard
// Manapool

