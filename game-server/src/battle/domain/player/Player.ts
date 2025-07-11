import * as lodash from 'lodash';
import { Entity, EntityId } from '../../infr/Entity';
import { Event } from '../../infr/Event';
import { Point } from '../../infr/Point';
import { Card, CardCreationData } from '../card/Card';
import { PlayerDrawnCardData, PlayerEventType, PlayerPlayCardAsManaData } from '../events';
import { Board } from '../board/Board';
import { GameConstants } from '../game/GameConstants';
import { PlayerData, PlayerState } from './PlayerState';
import { Area } from '../area/Area';
import { DomainError } from '../../infr/DomainError';

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
  deckId: string;
  deck: Array<CardCreationData>;
  heroes: Array<CardCreationData>;
}

class Player extends Entity {
  protected state: PlayerState;

  get manaPool (): Array<EntityId> { return this.state.manaPool; }
  get table (): Array<EntityId> { return this.state.table; }

  constructor (events: Array<Event<PlayerData>> = []) {
    super();
    this.state = new PlayerState(events);
  }

  public create (playerCreationData: PlayerCreationData, board: Board, isFirstPlayer: boolean, areas: Area[]): Array<Card> {
    let id = this.generateId();

    // TODO сделать проверку на минимальное количество стартовых карт.

    if (playerCreationData.deck.length < GameConstants.STARTING_HAND) {
      throw new DomainError(`Player ${this.state.id} have only ${playerCreationData.deck.length} cards in deck. ' +
        'It's should be ${GameConstants.STARTING_HAND} or great.`);
    }

    let cards = this.createCards(playerCreationData.deck);
    let heroes = this.createCards(playerCreationData.heroes);
    let allCards = cards.concat(heroes);

    let cardIds = allCards.map((card: Card) => card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.PLAYER_CREATED, { id, deck: cardIds }
    ));

    this.shuffleDeck();
    this.placeHeroes(heroes, board, isFirstPlayer, areas);
    this.drawStartingHand(isFirstPlayer);
    this.convertStartingMana(isFirstPlayer);

    return allCards;
  }

  public startTurn (table: Array<Card> = null): void {
    if (table) {
      this.checkForEndOfGame(table);
    }

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.TURN_STARTED,
      { status: PlayerStatus.MAKES_MOVE }
    ));
  }

  public endTurn (manaPool: Array<Card>, table: Array<Card>): void {
    this.checkIfItHisTurn();

    this.checkForEndOfGame(table);

    this.untapCardsAtEndOfTurn(manaPool, table);
    this.drawCard();

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.TURN_ENDED,
      { status: PlayerStatus.WAITING_FOR_TURN }
    ));
  }

  public playCardAsMana (card: Card): void {
    this.checkIfItHisTurn();

    if (!this.checkCardInStack(card, this.state.hand)) {
      throw new DomainError(`Card ${card.id} isn't in hand.`);
    }

    let { fromStack: hand, toStack: manaPool } = this.changeCardStack(CardStack.HAND, CardStack.MANA_POOL, card.id);

    this.applyEvent(new Event<PlayerData, PlayerPlayCardAsManaData>(
      PlayerEventType.CARD_PLAYED_AS_MANA,
      { manaPool, hand },
      { playedAsManaCard: card.id }
    ));

    card.tap();
  }

  public playCard (
    card: Card, manaPoolCards: Array<Card>, tableCards: Array<Card>,
    position: Point, board: Board, enemyPlayerTableCards: Card[], areas: Area[]
  ): void {
    this.checkIfItHisTurn();

    if (!this.checkCardInStack(card, this.state.hand)) {
      throw new DomainError(`Card ${card.id} isn't in hand.`);
    }

    const isPositionAdjacentToEnemies = board.checkIsPositionAdjacentToCards(position, enemyPlayerTableCards);
    if (isPositionAdjacentToEnemies) {
      throw new DomainError(`Card ${card.id} is adjacent to the enemy.`);
    }

    const CAST_CREATURE_DISTANCE = 2;
    const isPositionIsNear = this.assertPositionNearAtHeroOnDistance(position, CAST_CREATURE_DISTANCE, tableCards, board);
    if (!isPositionIsNear) {
      throw new DomainError(`Cant cast card ${card.id}. It far from heroes.`);
    }

    this.tapMana(card.manaCost, manaPoolCards);

    this.placeCardOnBoard(card, board, position, areas);

    card.makeAlive();
    card.tap();
  }

  public moveCard (card: Card, position: Point, board: Board, opponent: Player, areas: Area[]): void {
    this.checkIfItHisTurn();

    const isCardInTable = this.checkCardIn(card, CardStack.TABLE);
    if (!isCardInTable) {
      throw new DomainError(`Card ${card.id} not located in table of player ${this.id}`);
    }
    const path = board.getPathOfUnitMove(card, position, opponent, areas);
    const movePoints = path.length - 1;
    board.moveUnit(card, position, areas);

    card.move(movePoints, path);
  }

  public moveCardToCard (
    movedCard: Card, targetCard: Card, board: Board, opponent: Player, areas: Area[],
    movedCardPlayerTableCards: Card[], targetCardPlayerTableCards: Card[]
  ): void {
    const point = board.findPointToMove(movedCard, targetCard, areas, movedCardPlayerTableCards, targetCardPlayerTableCards);

    if (point === null) {
      throw new DomainError(`Card ${movedCard.id} cant reach card ${targetCard.id}`);
    }

    this.moveCard(movedCard, point, board, opponent, areas);
  }

  public healCard (healerCard: Card, healedCard: Card, board: Board, opponent: Player): void {
    this.checkIfItHisTurn();

    const isHealerCardInTable = this.checkCardIn(healerCard, CardStack.TABLE);
    if (!isHealerCardInTable) {
      throw new Error(`Card ${healerCard.id} not located in table of player ${this.id}`);
    }
    const isHealedCardInTable = this.checkCardIn(healedCard, CardStack.TABLE) || opponent.checkCardIn(healedCard, CardStack.TABLE);
    if (!isHealedCardInTable) {
      throw new Error(`Card ${healedCard.id} not located in table of player ${this.id} or ${opponent.id}`);
    }

    healerCard.heal();
    // distance
    const healedUnitPosition = board.getPositionOfUnit(healedCard);
    const healerUnitPosition = board.getPositionOfUnit(healerCard);

    const distance = board.getDistanceBetweenPositions(healedUnitPosition, healerUnitPosition);
    const range = healerCard.abilities.healing.range;
    if (distance > range) {
      throw new Error(`Card ${healerCard.id} to far away from ${healedCard.id} (${distance} tiles), should be not more then ${range}`);
    }

    const hpHeal = healerCard.abilities.healing.heal;
    healedCard.healed(hpHeal);
  }

  public useManaAbility (card: Card, playerManaPoolCards: Card[]): void {
    this.checkIfItHisTurn();

    if (!card.abilities.mana) {
      throw new Error(`Card ${this.state.id} doesn't have mana ability`);
    }

    const isCardInTable = this.checkCardIn(card, CardStack.TABLE);
    if (!isCardInTable) {
      throw new Error(`Card ${card.id} not located in table of player ${this.id}`);
    }

    card.tap();

    let tappedManaPoolCards = playerManaPoolCards.filter(card => card.tapped);
    if (tappedManaPoolCards.length > 0) {
      let manaPoolCardsToUntap = tappedManaPoolCards.slice(0, card.abilities.mana.mana);

      manaPoolCardsToUntap.forEach((card) => card.untap());
    }
  }

  public toAim (card: Card): void {
    this.checkIfItHisTurn();

    if (!card.abilities.aiming) {
      throw new Error(`Card ${this.state.id} doesn't have aiming ability`);
    }

    const isCardInTable = this.checkCardIn(card, CardStack.TABLE);
    if (!isCardInTable) {
      throw new Error(`Card ${card.id} not located in table of player ${this.id}`);
    }

    card.tap();

    card.toAim();
  }

  // TODO: это очень не правильно, данный метод находится не на своем уровне абстракции
  // Нужно создать глобальную шину и делать такое через эвенты и этот метод должен быть приватным
  public endOfCardDeath (card: Card): void {
    let { fromStack: table, toStack: graveyard } = this.changeCardStack(CardStack.TABLE, CardStack.GRAVEYARD, card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_DIED,
      { table, graveyard }, { diedCardId: card.id }
    ));
  }

  // TODO: Метод не на том уровне абстракции?
  public checkCardIn (card: Card, stackName: CardStack): boolean {
    let stack = this.getStackByName(stackName);
    return this.checkCardInStack(card, stack);
  }

  public checkCardIdIn (cardId: EntityId, stackName: CardStack): boolean {
    let stack = this.getStackByName(stackName);
    return this.checkCardIdInStack(cardId, stack);
  }

  // TODO: Метод не на том уровне абстракции?
  // Сделать геттером!
  public checkIfItHisTurn (): void {
    if (this.state.status === PlayerStatus.WAITING_FOR_TURN) {
      throw new DomainError(`Its not a turn of player: ${this.id}.`);
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

  private placeHeroes (heroes: Array<Card>, board: Board, isFirstPlayer: boolean, areas: Area[]): void {
    const y = isFirstPlayer ? 2 : GameConstants.BOARD_HEIGHT - 1;
    let position = new Point(Math.round(GameConstants.BOARD_WIDTH / 2) + 1, y);

    const hero = heroes[0];
    board.addUnitOnBoard(hero, position, areas);

    let { fromStack: deck, toStack: table } = this.changeCardStack(CardStack.DECK, CardStack.TABLE, hero.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_PLAYED,
      { table, deck }
    ));

    hero.prepareAtStartOfGame();

    // second hero
    if (heroes.length > 1) {
      const hero2 = heroes[1];
      let position = new Point(Math.round(GameConstants.BOARD_WIDTH / 2) - 1, y);

      board.addUnitOnBoard(hero2, position, areas);

      let { fromStack: deck, toStack: table } = this.changeCardStack(CardStack.DECK, CardStack.TABLE, hero2.id);

      this.applyEvent(new Event<PlayerData>(
        PlayerEventType.CARD_PLAYED,
        { table, deck }
      ));

      hero2.prepareAtStartOfGame();
    }
  }

  private drawStartingHand (isFirstPlayer: boolean): void {
    let drawCardNumber = isFirstPlayer ?
      GameConstants.STARTING_HAND - GameConstants.STARTING_HAND_HANDICAP :
      GameConstants.STARTING_HAND;

    for (let i = 1; i <= drawCardNumber; i++) {
      this.drawCard();
    }
  }

  private convertStartingMana (isFirstPlayer: boolean): void {
    let manaCardNumber = isFirstPlayer ?
      GameConstants.STARTING_MANA :
      GameConstants.STARTING_MANA + GameConstants.STARTING_MANA_HANDICAP;

    for (let i = 1; i <= manaCardNumber; i++) {
      let card = this.state.hand[i];

      let { fromStack: hand, toStack: manaPool } = this.changeCardStack(CardStack.HAND, CardStack.MANA_POOL, card);

      this.applyEvent(new Event<PlayerData, PlayerPlayCardAsManaData>(
        PlayerEventType.CARD_PLAYED_AS_MANA,
        { manaPool, hand },
        { playedAsManaCard: card }
      ));
    }
  }

  // Важные методы. Возможно могут стать публичными.
  private drawCard (): void {
    if (this.state.deck.length > 0) {
      let newDeck = lodash.clone(this.state.deck);
      let newHand = this.state.hand ? lodash.clone(this.state.hand) : [];

      let drawnCardId = newDeck.shift();
      newHand.push(drawnCardId);

      this.applyEvent(new Event<PlayerData, PlayerDrawnCardData>(
        PlayerEventType.CARD_DRAWN,
        { deck: newDeck, hand: newHand },
        { drawnCard: drawnCardId }
      ));
    }
  }

  private shuffleDeck (): void {
    let shuffledDeck = lodash.shuffle(this.state.deck);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.DECK_SHUFFLED, { deck: shuffledDeck }
    ));
  }

  private tapMana (manaNumber: number, manaPoolCards: Array<Card>): void {
    let untappedManaPoolCards = manaPoolCards.filter(card => !card.tapped);

    if (manaNumber > untappedManaPoolCards.length) {
      throw new DomainError('We need more mana!');
    }

    let manaPoolCardsToTap = untappedManaPoolCards.slice(untappedManaPoolCards.length - manaNumber, untappedManaPoolCards.length + 1);

    manaPoolCardsToTap.forEach((card) => card.tap());
  }

  private checkForEndOfGame (tableCards: Array<Card>): void {
    const heroes = tableCards.filter((card: Card) => card.hero);

    if (heroes.length === 0) {
      this.applyEvent(new Event<PlayerData>(
        PlayerEventType.PLAYER_LOST, {
          id: this.state.id
        }
      ));
    }
  }

  // Мелкие методы, части публичных и важных приватных.
  private untapCardsAtEndOfTurn (manaPoolCards: Array<Card>, tableCards: Array<Card>): void {
    let tappedManaPoolCards = manaPoolCards.filter(card => card.tapped);
    let manaPoolCardsToUntap = tappedManaPoolCards.slice(0, GameConstants.CARDS_PER_TURN);

    tableCards.forEach((card) => card.onEndOfTurn());
    manaPoolCardsToUntap.forEach((card) => card.untap());
  }

  private placeCardOnBoard (card: Card, board: Board, position: Point, areas: Area[]): void {
    board.addUnitOnBoard(card, position, areas);

    let { fromStack: hand, toStack: table } = this.changeCardStack(CardStack.HAND, CardStack.TABLE, card.id);

    this.applyEvent(new Event<PlayerData>(
      PlayerEventType.CARD_PLAYED,
      { table, hand }
    ));
  }

  private assertPositionNearAtHeroOnDistance (position: Point, distance: number, tableCards: Card[], board: Board): boolean {
    for (let card of tableCards) {
      if (card.hero) {
        const heroPosition = board.getPositionOfUnit(card);
        const distanceBetweenPoints = board.getDistanceBetweenPositions(position, heroPosition);

        if (distanceBetweenPoints <= distance) {
          return true;
        }
      }
    }
    return false;
  }

  // Хелперы
  private checkCardInStack (card: Card, stack: Array<EntityId>): boolean {
    return this.checkCardIdInStack(card.id, stack);
  }

  private checkCardIdInStack (cardId: EntityId, stack: Array<EntityId>): boolean {
    return stack.includes(cardId);
  }

  private changeCardStack (fromStackName: CardStack, toStackName: CardStack, cardId: EntityId)
    : { fromStack: Array<EntityId>, toStack: Array<EntityId> } {
    let fromStack: Array<EntityId> = this.getStackByName(fromStackName);
    let toStack: Array<EntityId> = this.getStackByName(toStackName);

    let newFromStack = lodash.clone(fromStack);
    let indexInArray = newFromStack.indexOf(cardId);

    if (indexInArray === -1) {
      throw new DomainError(
        `There is no card ${cardId} in stack. Cant move card from ${fromStackName} to ${toStackName}.`
      );
    }

    newFromStack.splice(newFromStack.indexOf(cardId), 1);

    let newToStack = lodash.clone(toStack);
    newToStack.push(cardId);

    return { fromStack: newFromStack, toStack: newToStack };
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
      stack = this.state.manaPool;
    }
    if (stackName === CardStack.GRAVEYARD) {
      stack = this.state.graveyard;
    }

    return stack;
  }
}

export { Player, PlayerStatus, CardStack, PlayerCreationData };
