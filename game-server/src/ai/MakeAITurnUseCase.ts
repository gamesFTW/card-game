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

class Action {
  card: Card;
  reasonableAction: Action;
  gameSituationAfterAction: GameSituation;
}

class MoveAction extends Action {
  toPoint: Point;

  constructor(card: Card, toPoint: Point) {
    super();

    this.card = card;
    this.toPoint = toPoint;
  }
}

class MeleeAttackAction extends Action {
  enemyCard: Card;

  constructor(card: Card, enemyCard: Card) {
    super();

    this.card = card;
    this.enemyCard = enemyCard;
  }
}

class RangeAttackAction extends Action {
  enemyCard: Card;

  constructor(card: Card, enemyCard: Card) {
    super();

    this.card = card;
    this.enemyCard = enemyCard;
  }
}

type GameSituation = {[key in EntityId]: Entity};

class MakeAITurnUseCase {
  repository: Repository;
  gameId: EntityId;
  activePlayerId: EntityId;
  waitingPlayerId: EntityId;

  constructor(gameId: EntityId) {
    this.gameId = gameId;
    this.repository = new Repository();
  }

  async execute() {
    const initialGameSituation = await this.createInitialGameSituation();
    console.time('AI');
    this.calcGameSituation(initialGameSituation);
    console.timeEnd("AI");
  }

  async createInitialGameSituation(): Promise<GameSituation> {
    const game = await this.repository.get<Game>(this.gameId, Game);

    this.activePlayerId = game.currentPlayersTurn;
    this.waitingPlayerId = game.currentPlayersOpponentTurn;

    const board = await this.repository.get<Board>(game.boardId, Board);
    const areas = await this.repository.getMany<Area>(board.areas, Area);

    const player1 = await this.repository.get<Player>(game.player1Id, Player);
    const player1Table = await this.repository.getMany<Card>(player1.table, Card);

    const player2 = await this.repository.get<Player>(game.player2Id, Player);
    const player2Table = await this.repository.getMany<Card>(player2.table, Card);

    const entities: Entity[] = [].concat([game, board, player1, player2], player1Table, player2Table, areas);

    const gameSituation: GameSituation = {};
    for (let entity of entities) {
      gameSituation[entity.id] = entity;
    }

    return gameSituation;
  }

  private async calcGameSituation(gameSituation: GameSituation, reasonableAction: Action = null) {
    const possibleActions = this.createPossibleActionsForGameSituation(gameSituation);

    const asd = await this.doAction(possibleActions[0], gameSituation);
    console.log(asd);
    // if (possibleActions.length > 0) {
    //   for (let action of possibleActions) {
    //     action.gameSituationAfterAction = await this.doAction(action, gameSituation);
    //     // action.reasonableAction = reasonableAction;
    //     //
    //     // this.calcGameSituation(action.gameSituationAfterAction, action);
    //   }
    // } else {
    //   // TODO: end of turn of gameSituation
    //   // this.calcScoreDifference(gameSituation);
    // }
  }

  createPossibleActionsForGameSituation(gameSituation: GameSituation): Action[] {
    const game = this.getEntityFromGameSituation<Game>(this.gameId, gameSituation);
    const board = this.getEntityFromGameSituation<Board>(game.boardId, gameSituation);
    const areas = this.getEntitiesFromGameSituation<Area>(board.areas, gameSituation);
    const activePlayer = this.getEntityFromGameSituation<Player>(this.activePlayerId, gameSituation);
    const waitingPlayer = this.getEntityFromGameSituation<Player>(this.waitingPlayerId, gameSituation);
    const activePlayerTableCards = this.getEntitiesFromGameSituation<Card>(activePlayer.table, gameSituation);
    const waitingPlayerTableCards = this.getEntitiesFromGameSituation<Card>(waitingPlayer.table, gameSituation);

    const actions = [];
    for (let card of activePlayerTableCards) {
      if (!card.tapped) {
        if (card.currentMovingPoints > 0) {
          let moveActions = this.getCardMoveActions(card, board, areas, activePlayerTableCards, waitingPlayerTableCards);
          actions.push(...moveActions);
        }

        // let meleeAttackActions = this.getCardMeleeAttackActions(card, board, areas, activePlayerTableCards, waitingPlayerTableCards);
        // actions.push(...meleeAttackActions);
        //
        // if (card.abilities.range) {
        //   let rangeAttackActions = this.getCardRangeAttackActions(card, board, areas, activePlayerTableCards, waitingPlayerTableCards);
        //   actions.push(...rangeAttackActions);
        // }
      }
    }

    return actions;
  }

  async doAction(action: Action, gameSituation: GameSituation): Promise<GameSituation> {
    const newGameSituation = lodash.cloneDeep(gameSituation);

    const repository = new InMemoryRepository(newGameSituation);
    const lifecycleMethods = {
      isAddEventListeners: false,
      isRunBusinessLogic: true,
      isSaveEntities: true
    };

    if (action instanceof MoveAction) {
      const usaCase = new MoveCardUseCase({
          gameId: this.gameId,
          playerId: this.activePlayerId,
          cardId: action.card.id,
          position: action.toPoint
        },
        repository,
        lifecycleMethods
        //TODO: придумать как обнулять ходы
      );

      await usaCase.execute();
    }

    return repository.getCache();
  }

  getCardMoveActions(
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

  // calcScoreDifference(): number {
  //   // вызываем calcScoreForPlayer для каждого игрока и вычитаем
  // }
  //
  // doAction(action: Action, gameSituation: GameSituation): GameSituation {
  //
  // }
  //
  // calcScoreForPlayer() {
  //
  // }

  getEntityFromGameSituation<EntityClass extends Entity>(entityId: EntityId, gameSituation: GameSituation): EntityClass {
    return gameSituation[entityId] as EntityClass;
  }

  getEntitiesFromGameSituation<EntityClass extends Entity>(entityIds: EntityId[], gameSituation: GameSituation): EntityClass[] {
    const entities = [];
    for (let entityId of entityIds) {
      entities.push(gameSituation[entityId] as EntityClass);
    }

    return entities;
  }
}

export { MakeAITurnUseCase };
