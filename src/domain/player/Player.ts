import * as lodash from 'lodash';

import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { PlayerData, PlayerDrawnCardData, PlayerState } from './PlayerState';
import { Card, CardCreationData } from '../card/Card';
import { GameConstants } from '../game/GameConstants';
import { PlayerEventType } from '../events';

enum PlayerStatus {
  MAKES_MOVE = 'MakesMove',
  WAITING_FOR_TURN = 'WaitingForTurn'
}

class Player extends Entity {
  protected state: PlayerState;

  get mannaPool (): Array<EntityId> { return this.state.mannaPool; }
  get table (): Array<EntityId> { return this.state.table; }

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

  public endTurn (mannaPool: Array<Card>, table: Array<Card>): void {
    if (this.state.status === PlayerStatus.WAITING_FOR_TURN) {
      throw new Error('Other players cant end player turn.');
    }

    this.untapCardsAtEndOfTurn(mannaPool, table);
    this.drawCard();

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.TURN_ENDED,
      {id: this.id, status: PlayerStatus.WAITING_FOR_TURN}
    ));
  }

  public startTurn (): void {
    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.TURN_STARTED,
      {id: this.id, status: PlayerStatus.MAKES_MOVE}
    ));
  }

  public shuffleDeck (): void {
    let shuffledDeck = lodash.shuffle(this.state.deck);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.DECK_SHUFFLED, {id: this.id, deck: shuffledDeck}
    ));
  }

  public drawCard (): void {
    let newDeck = lodash.clone(this.state.deck);
    let newHand = this.state.hand ? lodash.clone(this.state.hand) : [];

    let drawnCard = newDeck.shift();
    newHand.push(drawnCard);

    this.applyEvent(new Event<PlayerData, PlayerDrawnCardData>(
      PlayerEventType.CARD_DRAWN,
      {id: this.id, deck: newDeck, hand: newHand},
      {drawnCard: drawnCard}
    ));
  }

  private drawStartingHand (handicap: boolean): void {
    let drawCardNumber = handicap ?
      GameConstants.STARTING_HAND - GameConstants.HANDICAP :
      GameConstants.STARTING_HAND;

    for (let i = 1; i <= drawCardNumber; i++) {
      this.drawCard();
    }
  }

  private untapCardsAtEndOfTurn (mannaPool: Array<Card>, table: Array<Card>): void {
    let tappedMannaPoolCards = mannaPool.filter(card => card.tapped);
    let mannaPoolCardsToUntap = tappedMannaPoolCards.slice(0, GameConstants.CARDS_PER_TURN);

    table.forEach((card) => card.untap());
    mannaPoolCardsToUntap.forEach((card) => card.untap());
  }

  private createCards (cardsCreationData: Array<CardCreationData>): Array<Card> {
    return cardsCreationData.map((cardCreationData) => {
      let card = new Card();
      card.create(cardCreationData);

      return card;
    });
  }
}

export {Player, PlayerStatus};
