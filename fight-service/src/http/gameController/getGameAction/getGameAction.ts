import { EntityId } from '../../../infr/Entity';
import { Repository } from '../../../infr/repositories/Repository';
import { Game } from '../../../domain/game/Game';
import { Board } from '../../../domain/board/Board';
import { Player } from '../../../domain/player/Player';
import { Area } from '../../../domain/area/Area';
import { fillPlayer } from './fillPlayer';

const getGameAction = async (ctx: any) => {
  let gameId = ctx.query.gameId as EntityId;

  let repository = new Repository();

  let game = await repository.get<Game>(gameId, Game);

  let board = await repository.get<Board>(game.boardId, Board);

  let player1 = await repository.get<Player>(game.player1Id, Player);
  let player2 = await repository.get<Player>(game.player2Id, Player);

  let areas = await fillAreas(board, repository);

  let player1Response = await fillPlayer(player1, board, repository);
  let player2Response = await fillPlayer(player2, board, repository);

  let response = {
    game: Object(game).state,
    player1: player1Response,
    player2: player2Response,
    areas: areas
  };

  ctx.body = response;
};

const fillAreas = async (board: Board, repository: Repository): Promise<any> => {
  let areas = await repository.getMany<Area>(board.areas, Area);

  let areaResponses = [];

  for (let area of areas) {
    let areaResponse = Object(area).state;

    let position = board.getPositionOfArea(area);

    if (position) {
      areaResponse.x = position.x;
      areaResponse.y = position.y;
    }

    areaResponses.push(areaResponse);
  }

  return areaResponses;
};

export {getGameAction};
