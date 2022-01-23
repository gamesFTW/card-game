import { Entity, EntityId } from '../infr/Entity';
import { Card } from '../domain/card/Card';
import { Game } from '../domain/game/Game';
import { Repository } from '../infr/repositories/Repository';
import { Player } from '../domain/player/Player';
import { Board } from '../domain/board/Board';
import { Area } from '../domain/area/Area';
import { Point } from '../infr/Point';
import * as lodash from 'lodash';
import { MoveCardUseCase } from '../app/player/MoveCardUseCase';
import { InMemoryRepository } from '../infr/repositories/InMemoryRepository';
import { AttackCardUseCase } from '../app/player/AttackCardUseCase';
import { EndTurnUseCase } from '../app/game/EndTurnUseCase';
import { getEntitiesFromGameSituation, getEntityFromGameSituation } from './helpers';
import { ScoreCalculator } from './ScoreCalculator';

class Action {
  card: Card;
  reasonableAction: Action;
  gameSituationAfterAction: GameSituation;
  scoreAfterEndOfTurn?: number;
  scoreCalculationLog?: string;

  public getChain(): Action[] {
    const chain = [];
    let currentAction: Action = this;

    chain.push(currentAction);

    while (currentAction.reasonableAction) {
      currentAction = currentAction.reasonableAction;
      chain.push(currentAction);
    }

    return chain.reverse();
  }

  public consoleChain(): void {
    let chain = this.getChain();
    let text = `Score: ${this.scoreAfterEndOfTurn}\n`;

    for (let action of chain) {
      text += action.toString() + "\n";
    }
    console.info(text);
    console.log(this.scoreCalculationLog);
  }
}

class MoveAction extends Action {
  toPoint: Point;

  constructor(card: Card, toPoint: Point) {
    super();

    this.card = card;
    this.toPoint = toPoint;
  }

  public toString() {
    return `Move action of ${this.card.name}, to x: ${this.toPoint.x}, y: ${this.toPoint.y}`;
  }
}

class MeleeAttackAction extends Action {
  enemyCard: Card;

  constructor(card: Card, enemyCard: Card) {
    super();

    this.card = card;
    this.enemyCard = enemyCard;
  }

  public toString() {
    return `Melee attack action of ${this.card.name}, to ${this.enemyCard.name}`;
  }
}

class RangeAttackAction extends Action {
  enemyCard: Card;

  constructor(card: Card, enemyCard: Card) {
    super();

    this.card = card;
    this.enemyCard = enemyCard;
  }

  public toString() {
    return `Range attack action of ${this.card.name}, to ${this.enemyCard.name}`;
  }
}

type GameSituation = {[key in EntityId]: Entity};

class MakeAITurnUseCase {
  private repository: Repository;
  private gameId: EntityId;
  private activePlayerId: EntityId;
  private waitingPlayerId: EntityId;
  private endedActions: Action[] = [];

  constructor(gameId: EntityId) {
    this.gameId = gameId;
    this.repository = new Repository();
  }

  async execute() {
    const initialGameSituation = await this.createInitialGameSituation();

    await this.drawGameSituation(initialGameSituation);

    console.time('AI');
    await this.calcGameSituation(initialGameSituation);
    console.log("Variants: " + this.endedActions.length);

    const sortedEndedAction = this.endedActions.sort(
      (action1: Action, action2: Action) => action1.scoreAfterEndOfTurn - action2.scoreAfterEndOfTurn
    );

    sortedEndedAction[sortedEndedAction.length - 6].consoleChain();
    sortedEndedAction[sortedEndedAction.length - 5].consoleChain();
    sortedEndedAction[sortedEndedAction.length - 4].consoleChain();
    sortedEndedAction[sortedEndedAction.length - 3].consoleChain();
    sortedEndedAction[sortedEndedAction.length - 2].consoleChain();
    sortedEndedAction[sortedEndedAction.length - 1].consoleChain();

    console.timeEnd("AI");
  }

  private async createInitialGameSituation(): Promise<GameSituation> {
    const game = await this.repository.get<Game>(this.gameId, Game);

    this.activePlayerId = game.currentPlayersTurn;
    this.waitingPlayerId = game.currentPlayersOpponentTurn;

    const board = await this.repository.get<Board>(game.boardId, Board);
    const areas = await this.repository.getMany<Area>(board.areas, Area);

    const player1 = await this.repository.get<Player>(game.player1Id, Player);
    const player1Table = await this.repository.getMany<Card>(player1.table, Card);

    const player2 = await this.repository.get<Player>(game.player2Id, Player);
    const player2Table = await this.repository.getMany<Card>(player2.table, Card);

    // Для оптимизации: player1ManaPool нужен только на этапе end of turn, а до этого его нет смысла копировать
    const player1ManaPool = await this.repository.getMany <Card>(player1.manaPool, Card);

    const entities: Entity[] = [].concat(
      [game, board, player1, player2], player1Table, player2Table, areas, player1ManaPool
    );

    const gameSituation: GameSituation = {};
    for (let entity of entities) {
      gameSituation[entity.id] = entity;
    }

    return gameSituation;
  }

  private async calcGameSituation(gameSituation: GameSituation, reasonableAction: Action = null) {
    const possibleActions = this.createPossibleActionsForGameSituation(gameSituation);

    if (possibleActions.length > 0) {
      for (let action of possibleActions) {
        action.gameSituationAfterAction = await this.doAction(action, gameSituation);
        action.reasonableAction = reasonableAction;

        await this.calcGameSituation(action.gameSituationAfterAction, action);
      }
    } else {
      let gameSituationAfterEndOfTurn = await this.endTurnOfGameSituation(gameSituation);

      const scoreCalculator = new ScoreCalculator();

      reasonableAction.scoreAfterEndOfTurn = scoreCalculator.execute(
        gameSituationAfterEndOfTurn, this.gameId, this.activePlayerId, this.waitingPlayerId
      );

      reasonableAction.scoreCalculationLog = scoreCalculator.calculationLog;

      this.endedActions.push(reasonableAction);
    }
  }

  private createPossibleActionsForGameSituation(gameSituation: GameSituation): Action[] {
    const game = getEntityFromGameSituation<Game>(this.gameId, gameSituation);
    const board = getEntityFromGameSituation<Board>(game.boardId, gameSituation);
    const areas = getEntitiesFromGameSituation<Area>(board.areas, gameSituation);
    const activePlayer = getEntityFromGameSituation<Player>(this.activePlayerId, gameSituation);
    const waitingPlayer = getEntityFromGameSituation<Player>(this.waitingPlayerId, gameSituation);
    const activePlayerTableCards = getEntitiesFromGameSituation<Card>(activePlayer.table, gameSituation);
    const waitingPlayerTableCards = getEntitiesFromGameSituation<Card>(waitingPlayer.table, gameSituation);

    const actions = [];

    // TODO: добавить возможность пасануть и ничего не делать

    for (let card of activePlayerTableCards) {
      if (!card.tapped) {
        if (card.currentMovingPoints > 0) {
          let moveActions = this.getCardMoveActions(card, board, areas, activePlayerTableCards, waitingPlayerTableCards);
          actions.push(...moveActions);
        }

        let meleeAttackActions = this.getCardMeleeAttackActions(card, board, areas, activePlayerTableCards, waitingPlayerTableCards);
        actions.push(...meleeAttackActions);

        if (card.abilities.range) {
          let rangeAttackActions = this.getCardRangeAttackActions(card, board, areas, activePlayerTableCards, waitingPlayerTableCards);
          actions.push(...rangeAttackActions);
        }
      }
    }

    return actions;
  }

  private async doAction(action: Action, gameSituation: GameSituation): Promise<GameSituation> {
    const newGameSituation = this.deepCopyWithMethods(gameSituation);

    const repository = new InMemoryRepository(newGameSituation);
    const lifecycleMethods = {
      isAddEventListeners: false,
      isRunBusinessLogic: true,
      isSaveEntities: true
    };

    let useCase;

    if (action instanceof MoveAction) {
      useCase = new MoveCardUseCase({
          gameId: this.gameId,
          playerId: this.activePlayerId,
          cardId: action.card.id,
          position: action.toPoint,
          isSpendAllMovingPoints: true
        },
        repository,
        lifecycleMethods
      );
    }

    if (action instanceof MeleeAttackAction) {
      useCase = new AttackCardUseCase({
          gameId: this.gameId,
          attackerPlayerId: this.activePlayerId,
          attackerCardId: action.card.id,
          attackedCardId: action.enemyCard.id,
          isRangeAttack: false
        },
        repository,
        lifecycleMethods
      );
    }

    if (action instanceof RangeAttackAction) {
      useCase = new AttackCardUseCase({
          gameId: this.gameId,
          attackerPlayerId: this.activePlayerId,
          attackerCardId: action.card.id,
          attackedCardId: action.enemyCard.id,
          isRangeAttack: true
        },
        repository,
        lifecycleMethods
      );
    }

    await useCase.execute();

    return repository.getCache();
  }

  private async endTurnOfGameSituation(gameSituation: GameSituation): Promise<GameSituation> {
    const newGameSituation = this.deepCopyWithMethods(gameSituation);

    const repository = new InMemoryRepository(newGameSituation);
    const lifecycleMethods = {
      isAddEventListeners: false,
      isRunBusinessLogic: true,
      isSaveEntities: true
    };

    let useCase = new EndTurnUseCase({
        gameId: this.gameId,
        endingTurnPlayerId: this.activePlayerId
      },
      repository,
      lifecycleMethods
    );

    await useCase.execute();

    return repository.getCache();
  }

  private getCardMoveActions(
    card: Card, board: Board, areas: Area[], activePlayerTableCards: Card[], waitingPlayerTableCards: Card[]
  ): Action[] {
    const points = board.findUnitReach(card, areas, activePlayerTableCards, waitingPlayerTableCards);
    return points.map((point) => {
      return new MoveAction(card, point);
    });
  }

  getCardMeleeAttackActions(
    card: Card, board: Board, areas: Area[], activePlayerTableCards: Card[], waitingPlayerTableCards: Card[]
  ): Action[] {
    const nearbyEnemies = board.getEnemiesAroundOfUnit(card, waitingPlayerTableCards);
    return nearbyEnemies.map((enemy) => {
      return new MeleeAttackAction(card, enemy);
    });
  }

  getCardRangeAttackActions(
    card: Card, board: Board, areas: Area[], activePlayerTableCards: Card[], waitingPlayerTableCards: Card[]
  ): Action[] {
    const enemies = board.getEnemiesForRangeAttackOfCard(card, waitingPlayerTableCards, areas);
    return enemies.map((enemy) => {
      return new RangeAttackAction(card, enemy);
    });
  }

  // Метод нужен, так как cloneDeep не копирует методы
  private deepCopyWithMethods(obj: any) {
    if (obj == null || typeof obj !== "object") {
      return obj;
    } else if (obj instanceof Array) {
      // Но если внутри будут объекты, то опять же методы не будут скопированны
      return lodash.cloneDeep(obj);
    }

    let result: any = {};
    let keys_ = Object.getOwnPropertyNames(obj);

    for(let i = 0; i < keys_.length; i++) {
      let key = keys_[i], value = this.deepCopyWithMethods(obj[key]);
      result[key] = value;
    }

    Object.setPrototypeOf(result, obj.__proto__);

    return result;
  }

  private async drawGameSituation(gameSituation: GameSituation) {
    const repository = new InMemoryRepository(gameSituation);
    const game = await repository.get<Game>(this.gameId, Game);
    const board = await repository.get<Board>(game.boardId, Board);
    board.drawBoard();
  }
}

export { MakeAITurnUseCase, GameSituation };
