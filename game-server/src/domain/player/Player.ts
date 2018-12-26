import * as lodash from 'lodash';
import { Entity, EntityId } from '../../infr/Entity';
import { Event } from '../../infr/Event';
import { Point } from '../../infr/Point';
import { Card, CardCreationData } from '../card/Card';
import { PlayerEventType } from '../events';
import { Board } from '../board/Board';
import { GameConstants } from '../game/GameConstants';
import { PlayerData, PlayerDrawnCardData, PlayerPlayCardAsMannaData, PlayerState } from './PlayerState';

enum CardStack {
  DECK = 'deck',
  HAND = 'hand',
  TABLE = 'table',
  MANA_POOL = 'manaPool',
  GRAVEYARD = 'graveyard'
}

enum PlayerStatus {
  MAKES_MOVE = 'MakesMove',
  WAITING_FOR_TURN = 'WaitingForTurn'
}

interface PlayerCreationData {
  deck: Array<CardCreationData>;
  heroes: Array<CardCreationData>;
}

class Player extends Entity {
  protected state: PlayerState;

  get mannaPool (): Array<EntityId> { return this.state.mannaPool; }
  get table (): Array<EntityId> { return this.state.table; }

  constructor (events: Array<Event<PlayerData>> = []) {
    super();
    this.state = new PlayerState(events);
  }

  public create (playerCreationData: PlayerCreationData, board: Board, isFirstPlayer: boolean): Array<Card> {
    let id = this.generateId();

    // TODO сделать проверку на минимальное количество стартовых карт.

    let cards = this.createCards(playerCreationData.deck);
    let heroes = this.createCards(playerCreationData.heroes);
    let allCards = cards.concat(heroes);

    let cardIds = allCards.map((card: Card) => card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.PLAYER_CREATED, {id, deck: cardIds}
    ));

    this.shuffleDeck();
    this.placeHeroes(heroes, board, isFirstPlayer);
    this.drawStartingHand(isFirstPlayer);

    return allCards;
  }

  public startTurn (): void {
    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.TURN_STARTED,
      {status: PlayerStatus.MAKES_MOVE}
    ));
  }

  public endTurn (mannaPool: Array<Card>, table: Array<Card>): void {
    this.checkIfItHisTurn();

    this.untapCardsAtEndOfTurn(mannaPool, table);
    this.drawCard();

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.TURN_ENDED,
      {status: PlayerStatus.WAITING_FOR_TURN}
    ));
  }

  public playCardAsManna (card: Card): void {
    this.checkIfItHisTurn();

    if (!this.checkCardInStack(card, this.state.hand)) {
      throw new Error(`Card ${card.id} isn't in hand`);
    }

    let {fromStack: hand, toStack: mannaPool} = this.changeCardStack(CardStack.HAND, CardStack.MANA_POOL, card.id);

    this.applyEvent(new Event<PlayerData, PlayerPlayCardAsMannaData>(
      PlayerEventType.CARD_PLAYED_AS_MANNA,
      {mannaPool, hand},
      {playedAsMannaCard: card.id}
    ));

    card.tap();
  }

  public playCard (card: Card, mannaPoolCards: Array<Card>, position: Point, board: Board): void {
    this.checkIfItHisTurn();

    if (!this.checkCardInStack(card, this.state.hand)) {
      throw new Error(`Card ${card.id} isn't in hand`);
    }

    this.tapManna(card.mannaCost, mannaPoolCards);

    // TODO: проверить на наличие рядом героя и на отсутствие врагов

    this.placeCardOnBoard(card, board, position);

    card.play();
  }

  public moveCard (card: Card, position: Point, board: Board): void {
    this.checkIfItHisTurn();

    board.moveUnit(card, position);

    card.move(1);
  }

  // TODO: это очень не правильно, данный метод находится не на своем уровне абстракции
  // Нужно создать глобальную шину и делать такое через эвенты и этот метод должен быть приватным
  public endOfCardDeath (card: Card): void {
    let {fromStack: table, toStack: graveyard} = this.changeCardStack(CardStack.TABLE, CardStack.GRAVEYARD, card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_DIED,
      {table, graveyard}, {diedCardId: card.id}
    ));
  }

  // TODO: Метод не на том уровне абстракции?
  public checkCardIn (card: Card, stackName: CardStack): boolean {
    let stack = this.getStackByName(stackName);
    return this.checkCardInStack(card, stack);
  }

  // TODO: Метод не на том уровне абстракции?
  // Сделать геттером!
  public checkIfItHisTurn (): void {
    if (this.state.status === PlayerStatus.WAITING_FOR_TURN) {
      throw new Error(`Its not a turn of player: ${this.id}.`);
    }
  }

  // Стартовые методы

  // TODO: Метод не на том уровне абстракции?
  private createCards (cardsCreationData: Array<CardCreationData>): Array<Card> {
    return cardsCreationData.map((cardCreationData) => {
      let card = new Card();
      card.create(cardCreationData);

      return card;
    });
  }

  private placeHeroes (heroes: Array<Card>, board: Board, isFirstPlayer: boolean): void {
    let y = isFirstPlayer ? 1 : GameConstants.BOARD_HEIGHT;
    let position = new Point(Math.round(GameConstants.BOARD_WIDTH / 2), y);

    let hero = heroes[0];

    board.addUnitOnBoard(hero, position);

    let {fromStack: deck, toStack: table} = this.changeCardStack(CardStack.DECK, CardStack.TABLE, hero.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_PLAYED,
      {table, deck}
    ));

    hero.play();
  }

  private drawStartingHand (isFirstPlayer: boolean): void {
    let drawCardNumber = isFirstPlayer ?
      GameConstants.STARTING_HAND - GameConstants.HANDICAP :
      GameConstants.STARTING_HAND;

    for (let i = 1; i <= drawCardNumber; i++) {
      this.drawCard();
    }
  }

  // Важные методы. Возможно могут стать публичными.
  private drawCard (): void {
    let newDeck = lodash.clone(this.state.deck);
    let newHand = this.state.hand ? lodash.clone(this.state.hand) : [];

    let drawnCardId = newDeck.shift();
    newHand.push(drawnCardId);

    this.applyEvent(new Event<PlayerData, PlayerDrawnCardData>(
      PlayerEventType.CARD_DRAWN,
      {deck: newDeck, hand: newHand},
      {drawnCard: drawnCardId}
    ));
  }

  private shuffleDeck (): void {
    let shuffledDeck = lodash.shuffle(this.state.deck);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.DECK_SHUFFLED, {deck: shuffledDeck}
    ));
  }

  private tapManna (mannaNumber: number, mannaPoolCards: Array<Card>): void {
    let untappedMannaPoolCards = mannaPoolCards.filter(card => !card.tapped);

    if (mannaNumber > untappedMannaPoolCards.length ) {
      throw new Error('We need more manna!');
    }

    let mannaPoolCardsToTap = untappedMannaPoolCards.slice(0, mannaNumber);

    mannaPoolCardsToTap.forEach((card) => card.tap());
  }

  // Мелкие методы, части публичных и важных приватных.
  private untapCardsAtEndOfTurn (mannaPool: Array<Card>, table: Array<Card>): void {
    let tappedMannaPoolCards = mannaPool.filter(card => card.tapped);
    let mannaPoolCardsToUntap = tappedMannaPoolCards.slice(0, GameConstants.CARDS_PER_TURN);

    table.forEach((card) => card.onEndOfTurn());
    mannaPoolCardsToUntap.forEach((card) => card.untap());
  }

  private placeCardOnBoard (card: Card, board: Board, position: Point): void {
    board.addUnitOnBoard(card, position);

    let {fromStack: hand, toStack: table} = this.changeCardStack(CardStack.HAND, CardStack.TABLE, card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_PLAYED,
      {table, hand}
    ));
  }

  // Хелперы
  private checkCardInStack (card: Card, stack: Array<EntityId>): boolean {
    return stack.indexOf(card.id) >= 0 ? true : false;
  }

  private changeCardStack (fromStackName: CardStack, toStackName: CardStack, cardId: EntityId)
      : {fromStack: Array<EntityId>, toStack: Array<EntityId>} {
    let fromStack: Array<EntityId> = this.getStackByName(fromStackName);
    let toStack: Array<EntityId> = this.getStackByName(toStackName);

    let newFromStack = lodash.clone(fromStack);
    let indexInArray = newFromStack.indexOf(cardId);

    if (indexInArray === -1) {
      throw new Error(
        `There is no card ${cardId} in stack. Cant move card from ${fromStackName} to ${toStackName}.`
      );
    }

    newFromStack.splice(newFromStack.indexOf(cardId), 1);

    let newToStack = lodash.clone(toStack);
    newToStack.push(cardId);

    return {fromStack: newFromStack, toStack: newToStack};
  }

  private getStackByName (stackName: CardStack): Array<EntityId> {
    let stack;
    if (stackName === CardStack.DECK) {
      stack = this.state.deck;
    }
    if (stackName === CardStack.HAND) {
      stack = this.state.hand;
    }
    if (stackName === CardStack.TABLE) {
      stack = this.state.table;
    }
    if (stackName === CardStack.MANA_POOL) {
      stack = this.state.mannaPool;
    }
    if (stackName === CardStack.GRAVEYARD) {
      stack = this.state.graveyard;
    }

    return stack;
  }
}

export {Player, PlayerStatus, CardStack, PlayerCreationData};
