import * as lodash from 'lodash';

import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { PlayerData, PlayerState } from './PlayerState';
import { Card, CardCreationData } from '../card/Card';
import { GameConstants } from '../game/GameConstants';
import { PlayerEventType } from '../events';

class Player extends Entity {
  protected state: PlayerState;

  constructor (events: Array<Event<PlayerData>> = []) {
    super();
    this.state = new PlayerState(events);
  }

  public create (cardsCreationData: Array<CardCreationData>, handicap: boolean): {cards: Array<Card>} {
    let id = this.generateId();

    let cards = this.createCards(cardsCreationData);

    let cardIds = cards.map((card: Card) => card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.PLAYER_CREATED, {id, deck: cardIds}
    ));

    this.shuffleDeck();
    this.drawStartingHand(handicap);

    return {cards};
  }

  public shuffleDeck (): void {
    let shuffledDeck = lodash.shuffle(this.state.deck);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.DECK_SHUFFLED, {id: this.id, deck: shuffledDeck}
    ));
  }

  public drawStartingHand (handicap: boolean): void {
    let drawCardNumber = handicap ?
      GameConstants.STARTING_HAND - GameConstants.HANDICAP :
      GameConstants.STARTING_HAND;

    for (let i = 1; i <= drawCardNumber; i++) {
      this.drawCard();
    }
  }

  public drawCard (): void {
    let newDeck = lodash.clone(this.state.deck);
    let newHand = this.state.hand ? lodash.clone(this.state.hand) : [];

    let drawnCard = newDeck.shift();
    newHand.push(drawnCard);

    // TODO добавить инфу о том какая карта передана.

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_DRAWN, {id: this.id, deck: newDeck, hand: newHand}
    ));
  }

  private createCards (cardsCreationData: Array<CardCreationData>): Array<Card> {
    return cardsCreationData.map((cardCreationData) => {
      let card = new Card();
      card.create(cardCreationData);

      return card;
    });
  }
}

export {Player};
