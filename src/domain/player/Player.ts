import * as lodash from 'lodash';

import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { PlayerData, PlayerDrawnCardData, PlayerPlayCardAsMannaData, PlayerState } from './PlayerState';
import { Card, CardCreationData } from '../card/Card';
import { GameConstants } from '../game/GameConstants';
import { PlayerEventType } from '../events';
import { Point } from '../../infr/Point';
import { Field } from '../field/Field';

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
    this.checkIfItHisTurn();

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

    let drawnCardId = newDeck.shift();
    newHand.push(drawnCardId);

    this.applyEvent(new Event<PlayerData, PlayerDrawnCardData>(
      PlayerEventType.CARD_DRAWN,
      {id: this.id, deck: newDeck, hand: newHand},
      {drawnCard: drawnCardId}
    ));
  }

  public playCardAsManna (card: Card): void {
    this.checkIfItHisTurn();

    if (!this.checkCardIn(card, this.state.hand)) {
      throw new Error(`Card ${card.id} isn't in hand`);
    }

    let {fromStack: hand, toStack: mannaPool} = this.changeStack(this.state.hand, this.state.mannaPool, card.id);

    this.applyEvent(new Event<PlayerData, PlayerPlayCardAsMannaData>(
      PlayerEventType.CARD_PLAYED_AS_MANNA,
      {id: this.id, mannaPool, hand},
      {playedAsMannaCard: card.id}
    ));

    card.tap();
  }

  public playCard (card: Card, mannaPoolCards: Array<Card>, position: Point, field: Field): void {
    this.checkIfItHisTurn();

    if (!this.checkCardIn(card, this.state.hand)) {
      throw new Error(`Card ${card.id} isn't in hand`);
    }

    this.tapManna(card.mannaCost, mannaPoolCards);

    // TODO: проверить на наличие рядом героя и на отсутствие врагов

    field.addCardToField(card, position);

    let {fromStack: hand, toStack: table} = this.changeStack(this.state.hand, this.state.table, card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_PLAYED,
      {id: this.id, table, hand}
    ));

    card.play();
  }

  public moveCreature (card: Card, position: Point, field: Field): void {
    this.checkIfItHisTurn();

    field.moveCreature(card, position);

    card.move(1);
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

    table.forEach((card) => card.untapOnEndOfTurn());
    mannaPoolCardsToUntap.forEach((card) => card.untap());
  }

  private createCards (cardsCreationData: Array<CardCreationData>): Array<Card> {
    return cardsCreationData.map((cardCreationData) => {
      let card = new Card();
      card.create(cardCreationData);

      return card;
    });
  }

  private checkIfItHisTurn (): void {
    if (this.state.status === PlayerStatus.WAITING_FOR_TURN) {
      throw new Error(`Its not a turn of player: ${this.id}.`);
    }
  }

  private checkCardIn (card: Card, stack: Array<EntityId>): boolean {
    return stack.indexOf(card.id) >= 0 ? true : false;
  }

  private tapManna (mannaNumber: number, mannaPoolCards: Array<Card>): void {
    let untappedMannaPoolCards = mannaPoolCards.filter(card => !card.tapped);

    if (mannaNumber > untappedMannaPoolCards.length ) {
      throw new Error('We need more manna!');
    }

    let mannaPoolCardsToTap = untappedMannaPoolCards.slice(0, mannaNumber);

    mannaPoolCardsToTap.forEach((card) => card.tap());
  }

  private changeStack (fromStack: Array<EntityId>, toStack: Array<EntityId>, cardId: EntityId)
      : {fromStack: Array<EntityId>, toStack: Array<EntityId>} {
    let newFromStack = lodash.clone(fromStack);
    newFromStack.splice(newFromStack.indexOf(cardId), 1);

    let newToStack = lodash.clone(toStack);
    newToStack.push(cardId);

    return {fromStack: newFromStack, toStack: newToStack};
  }
}

export {Player, PlayerStatus};
