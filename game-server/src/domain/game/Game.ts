import * as lodash from 'lodash';

import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { GameData, GameState } from './GameState';
import { Player, PlayerCreationData } from '../player/Player';
import { Card } from '../card/Card';
import { GameEventType } from '../events';
import { Board } from '../board/Board';
import { GameConstants } from './GameConstants';
import { RangeService } from '../abilities/RangeService';
import { Area } from '../area/Area';
import { AreaType } from '../area/AreaState';
import { Point } from '../../infr/Point';

class Game extends Entity {
  protected state: GameState;

  get player1Id (): EntityId { return this.state.player1Id; }
  get player2Id (): EntityId { return this.state.player2Id; }
  get boardId (): EntityId { return this.state.boardId; }
  get currentTurn (): number { return this.state.currentTurn; }

  constructor (events: Array<Event<GameData>> = []) {
    super();
    this.state = new GameState(events);
  }

  public create (playerACreationData: PlayerCreationData, playerBCreationData: PlayerCreationData): {
    player1: Player, player2: Player, player1Cards: Array<Card>, player2Cards: Array<Card>, board: Board, areas: Area[]
  } {
    let id = this.generateId();

    let board = new Board();
    board.create(GameConstants.BOARD_WIDTH, GameConstants.BOARD_HEIGHT);

    // Более красивее было бы сначала создать игроков и потом их зашафлить.
    let playersCreationData = lodash.shuffle([playerACreationData, playerBCreationData]);

    let areas = this.generateStartingAreas(board);

    let {player: player1, cards: player1Cards} = this.createPlayer(playersCreationData[0], board, true, areas);
    let {player: player2, cards: player2Cards} = this.createPlayer(playersCreationData[1], board, false, areas);

    this.applyEvent(new Event<GameData>(
      GameEventType.GAME_CREATED,
      {
        id,
        player1Id: player1.id,
        player2Id: player2.id,
        currentPlayersTurn: player1.id,
        boardId: board.id
      }
    ));

    player1.startTurn();

    return {player1, player2, player1Cards, player2Cards, board, areas};
  }

  public endTurn (
    endingTurnPlayer: Player,
    endingTurnPlayerOpponent: Player,
    endingTurnPlayerManaPoolCards: Card[],
    endingTurnPlayerTableCards: Card[],
    endingTurnPlayerOpponentTableCards: Card[],
    board: Board
  ): void {
    endingTurnPlayer.endTurn(endingTurnPlayerManaPoolCards, endingTurnPlayerTableCards);

    this.applyEvent(new Event<GameData>(
      GameEventType.TURN_ENDED,
      {currentPlayersTurn: endingTurnPlayerOpponent.id, currentTurn: this.state.currentTurn + 1}
    ));

    endingTurnPlayerOpponent.startTurn();

    RangeService.applyBlockForRangeUnits(endingTurnPlayerOpponentTableCards, endingTurnPlayerTableCards, board);
  }

  public getPlayerIdWhichIsOpponentFor (playerId: EntityId): EntityId {
    return playerId === this.state.player1Id ? this.state.player2Id : this.state.player1Id;
  }

  private createPlayer (playerCreationData: PlayerCreationData, board: Board, isFirstPlayer: boolean, areas: Area[]):
      {player: Player, cards: Array<Card>} {
    let player = new Player();
    let cards = player.create(playerCreationData, board, isFirstPlayer, areas);

    return {player, cards};
  }

  private generateStartingAreas (board: Board): Area[] {
    let points = [];
    for (let x = 1; x <= 9; x++) {
      for (let y = 3; y <= 7; y++) {
        points.push((new Point(x, y)));
      }
    }

    points = lodash.sample(points, 12);

    let areas = [];
    for (let point of points) {
      let areaTypes = [AreaType.MOUNTAIN, AreaType.WIND_WALL, AreaType.LAKE];
      let area = this.createArea(board, lodash.sample(areaTypes), point);
      areas.push(area);
    }

    return areas;
  }

  private createArea (board: Board, type: AreaType, position: Point): Area {
    let area = new Area();
    area.create({type});

    board.addAreaOnBoard(area, position);

    return area;
  }
}

export {Game};
