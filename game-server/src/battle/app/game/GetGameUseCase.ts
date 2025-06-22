import { Area } from "../../domain/area/Area";
import { AreaState } from "../../domain/area/AreaState";
import { Board } from "../../domain/board/Board";
import { Card } from "../../domain/card/Card";
import { CardState } from "../../domain/card/CardState";
import { Game } from "../../domain/game/Game";
import { GameState } from "../../domain/game/GameState";
import { Player, PlayerStatus } from "../../domain/player/Player";
import { EntityId } from "../../infr/Entity";
import { Repository } from "../../infr/repositories/Repository";

type GameDto = {
    game: GameState,
    player1: PlayerDto,
    player2: PlayerDto,
    areas: AreaDto[]
};

type AreaDto = AreaState & { x?: number; y?: number};

type PlayerDto = {
    id: EntityId;
    deck: Array<CardDto>;
    hand: Array<CardDto>;
    manaPool: Array<CardDto>;
    table: Array<CardDto>;
    graveyard: Array<CardDto>;
    status: PlayerStatus;
}

type CardDto = CardState & { x?: number; y?: number};

class GetGameUseCase {
    public async execute(gameId: EntityId): Promise<GameDto> {
        let repository = new Repository(gameId);

        let game = await repository.get<Game>(gameId, Game);

        let board = await repository.get<Board>(game.boardId, Board);

        let player1 = await repository.get<Player>(game.player1Id, Player);
        let player2 = await repository.get<Player>(game.player2Id, Player);

        let areas = await this.fillAreas(board, repository);

        let player1Response = await this.fillPlayer(player1, board, repository);
        let player2Response = await this.fillPlayer(player2, board, repository);

        return {
            game: game['state'],
            player1: player1Response,
            player2: player2Response,
            areas: areas
        };
    }

    private async fillAreas(board: Board, repository: Repository) {
        let areas = await repository.getMany<Area>(board.areas, Area);

        let areaResponses: AreaDto[] = [];

        for (let area of areas) {
            let areaResponse: AreaDto = area['state'];

            let position = board.getPositionOfArea(area);

            if (position) {
                areaResponse.x = position.x;
                areaResponse.y = position.y;
            }

            areaResponses.push(areaResponse);
        }

        return areaResponses;
    };

    private async fillPlayer(player: Player, board: Board, repository: Repository): Promise<PlayerDto> {
        const playerState = player['state'];
        const deck = await this.getCards(playerState.deck, board, repository);
        const hand = await this.getCards(playerState.hand, board, repository);
        const manaPool = await this.getCards(playerState.manaPool, board, repository);
        const table = await this.getCards(playerState.table, board, repository);
        const graveyard = await this.getCards(playerState.graveyard, board, repository);

        let playerDto = Object.assign({}, playerState, {deck, hand, manaPool, table, graveyard});

        return playerDto;
    };

    private async getCards(array: Array<EntityId>, board: Board, repository: Repository) {
        if (array.length === 0) {
            return [];
        }

        return await Promise.all(array.map(async (cardId: EntityId) => {
            let card = Object(await repository.get<Card>(cardId, Card)).state;
            let position = board.getPositionOfUnit(card);

            if (position) {
                card.x = position.x;
                card.y = position.y;
            }

            return card;
        }));
    };
}

export  { GetGameUseCase, GameDto, PlayerDto, AreaDto, CardDto }
