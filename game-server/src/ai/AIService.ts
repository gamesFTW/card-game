import { boundMethod } from "autobind-decorator";
import { EventBus } from "../battle/infr/EventBus"
import { LobbyUseCasas } from "../lobby/LobbyUseCases";
import { GameDto as LobbyGameDto } from "../lobby/dtos";
import { CardDto, GameDto, GetGameUseCase, PlayerDto } from "../battle/app/game/GetGameUseCase";
import { EntityId } from "../battle/infr/Entity";
import * as lodash from 'lodash';
import { PlayCardUseCase } from "../battle/app/player/PlayCardUseCase";
import { PlayCardAsManaUseCase } from "../battle/app/player/PlayCardAsManaUseCase";
import { MoveCardUseCase } from "../battle/app/player/MoveCardUseCase";
import { AttackCardUseCase } from "../battle/app/player/AttackCardUseCase";
import { EndTurnUseCase } from "../battle/app/game/EndTurnUseCase";
import PF from "pathfinding";

type ArrayPoint = number[];

class AiService {
    private lobbyUseCasas: LobbyUseCasas;

    constructor(lobbyUseCasas: LobbyUseCasas) {
        this.lobbyUseCasas = lobbyUseCasas;
        EventBus.on('TurnEnded', this.onTurnEndedHandler);
        EventBus.on('GameCreated', this.onTurnEndedHandler);
    }

    public async init(): Promise<void> {
        let lobbyGames = await this.lobbyUseCasas.getGames();

        lobbyGames = lobbyGames.filter((lobbyGame) => {
            return lobbyGame.deckName1.startsWith("AI") || lobbyGame.deckName2.startsWith("AI");
        });

        for (const lobbyGame of lobbyGames) {
            // Специально без await
            this.makeTurn(lobbyGame);
        }
    }

    @boundMethod
    private async onTurnEndedHandler(gameId: string) {
        try {
            let lobbyGames = await this.lobbyUseCasas.getGames([gameId]);
            let lobbyGame = lobbyGames[0];
            if (lobbyGame.deckName1.startsWith("AI") || lobbyGame.deckName2.startsWith("AI")) {
                this.makeTurn(lobbyGame);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async getGame(lobbyGame: LobbyGameDto) {
      const gateGameUseCase = new GetGameUseCase();
      const gameData = await gateGameUseCase.execute(lobbyGame.gameServerId as EntityId);
    
      let isAITurn = false;
      let currentPlayer: PlayerDto;
      let enemyPlayer: PlayerDto;
      let isFirstPlayerTurn = gameData.game.player1Id === gameData.game.currentPlayersTurn;
      let isSecondPlayerTurn = gameData.game.player2Id === gameData.game.currentPlayersTurn;
      let firstPlayerIsAI: boolean, secondPlayerIsAI: boolean;
    
      firstPlayerIsAI = this.isAIName(lobbyGame.deckName1);
      secondPlayerIsAI = this.isAIName(lobbyGame.deckName2);
    
      if (isFirstPlayerTurn && firstPlayerIsAI) {
        currentPlayer = gameData.player1;
        enemyPlayer = gameData.player2;
        isAITurn = true;
      }
    
      if (isSecondPlayerTurn && secondPlayerIsAI) {
        currentPlayer = gameData.player2;
        enemyPlayer = gameData.player1;
        isAITurn = true;
      }
    
      return {gameData, currentPlayer, enemyPlayer, isAITurn};
    }

    private async makeTurn(lobbyGame: LobbyGameDto): Promise<void> {
      try {
        let {gameData, currentPlayer, enemyPlayer, isAITurn} = await this.getGame(lobbyGame);
        
        if (gameData.game.gameEnded) {
            return;
        }

        if (isAITurn) {
            try {
                await this.wait(1000);
                if (currentPlayer.manaPool.length < 5) {
                    await this.playCardAsMana(lobbyGame.gameServerId, currentPlayer.id, currentPlayer.hand[0]);
                    await this.playCardAsMana(lobbyGame.gameServerId, currentPlayer.id, currentPlayer.hand[1]);
                }
            
                ({gameData, currentPlayer, enemyPlayer} = await this.getGame(lobbyGame));
            
                for await(let unit of currentPlayer.table) {
                    ({gameData, currentPlayer, enemyPlayer} = await this.getGame(lobbyGame));
                    await this.doUnitAction(gameData, currentPlayer, enemyPlayer, unit);
                    await this.wait(1500);
                }
            } catch(e) {
                console.error("Error while trying to make a turn:", e);
            }
        
            try {
                ({gameData, currentPlayer, enemyPlayer} = await this.getGame(lobbyGame));
                await this.playCards(gameData, currentPlayer, enemyPlayer);
            } catch(e) {
                console.log(e);
            }
        
            await this.endTurn(lobbyGame.gameServerId, currentPlayer.id);
        } else {
            console.log('> Its enemy turn');
        }
      } catch(error) {
        console.log(error);
      }
    }

    private async playCards(gameData: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto) {
      let mana = currentPlayer.manaPool.filter(card => !card.tapped).length;
      let cards = currentPlayer.hand.filter((card) => card.manaCost <= mana);
    
      let heroes = currentPlayer.table.filter((card) => card.hero);
    
      if (cards.length > 0 && heroes.length > 0) {
        const cardToPlay = cards[0];
    
        const map = this.createMap(gameData, currentPlayer, enemyPlayer);
        const pointsToCast = [];
        for (let hero of heroes) {
          if (map[hero.x - 1][hero.y] === 0){
            pointsToCast.push([hero.x - 1, hero.y]);
          }
          if (map[hero.x + 1][hero.y] === 0){
            pointsToCast.push([hero.x + 1, hero.y]);
          }
          if (map[hero.x][hero.y - 1] === 0){
            pointsToCast.push([hero.x, hero.y - 1]);
          }
          if (map[hero.x][hero.y + 1] === 0){
            pointsToCast.push([hero.x, hero.y + 1]);
          }
        }
    
        let point = lodash.sample(pointsToCast);
    
        await this.playCard(gameData.game.id, currentPlayer.id, cardToPlay, point);
      }
    }
    
    private async doUnitAction(game: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto, unit: CardDto) {
      let adjacentUnit = this.getAdjacentUnit(game, currentPlayer, enemyPlayer, unit);
    
      if (adjacentUnit) {
        // Можно бить
        await this.attack(game.game.id, currentPlayer.id, unit, adjacentUnit);
      } else {
        if (unit.currentMovingPoints > 0) {
          const ignoreTiles: ArrayPoint[] = [];
          let i = 1;
          await this.moveOrAttackLoop(game, currentPlayer, enemyPlayer, unit, i, ignoreTiles);
        }
      }
    }
    
    private async moveOrAttackLoop(game: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto, unit: CardDto, i: number, ignoreTiles: ArrayPoint[]) {
      const result = await this.moveOrAttack(game, currentPlayer, enemyPlayer, unit, ignoreTiles);
    
      if (result.result === 'ok') {
        return;
      } else if (i < 3) {
        ignoreTiles.push(result.point);
        i++;
        await this.moveOrAttackLoop(game, currentPlayer, enemyPlayer, unit, i, ignoreTiles);
      }
    }
    
    private async moveOrAttack(game: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto, unit: CardDto, ignoreTiles: ArrayPoint[]) {
      let {shortestPathUnit, shortestPath} = this.findShortestPath(game, currentPlayer, enemyPlayer, unit, ignoreTiles);
    
      if (shortestPath.length > unit.currentMovingPoints) {
        // Нужно идти
        let point = shortestPath[unit.currentMovingPoints - 1];
        const result = await this.move(game.game.id, currentPlayer.id, unit, point);
        return {result, point};
      } else {
        // Можно подойти и ударить
        let point = shortestPath[shortestPath.length - 1];
        const result = await this.move(game.game.id, currentPlayer.id, unit, point);
        if (result === 'fail') {
          return {result, point};
        }
        await this.wait(700);
        await this.attack(game.game.id, currentPlayer.id, unit, shortestPathUnit);
        return {result: 'ok'};
      }
    }
    
    private async playCard(gameId: EntityId, playerId: EntityId, unit: CardDto, point: ArrayPoint) {
      console.log(`Try cast card to x:${point[0]} y:${point[1]}`);
    
      try {
        let useCase = new PlayCardUseCase({gameId, playerId, cardId: unit.id, position: { x: point[0], y: point[1]}});
        await useCase.execute();
        return 'ok';
      } catch(e) {
        console.log(e);
        return 'fail';
      }        
    }
    
    private async playCardAsMana(gameId: EntityId, playerId: EntityId, unit: CardDto) {
      console.log(`Try cast card as mana`);
    
      try {
        let useCase = new PlayCardAsManaUseCase({gameId, playerId, cardId: unit.id});
        await useCase.execute();
      } catch(e) {
        console.log(e);
      }
    }
    
    private async move(gameId: EntityId, playerId: EntityId, unit: CardDto, point: ArrayPoint) {
      console.log(`Unit x:${unit.x} y:${unit.y} try to move to x:${point[0]} y:${point[1]}`);

      try {
        let useCase = new MoveCardUseCase({gameId, playerId, cardId: unit.id, position: { x: point[0], y: point[1]}});
        await useCase.execute();
        return 'ok';
      } catch(e) {
        console.log(e);
        return 'fail';
      }
    }
    
    private async attack(gameId: EntityId, playerId: EntityId, unit: CardDto, attackedCard: CardDto) {
      console.log(`Unit x:${unit.x} y:${unit.y} try to attack unit x:${attackedCard.x} y:${attackedCard.y}`);
    
      try {
        let attackCard = new AttackCardUseCase({gameId, attackerPlayerId: playerId, attackerCardId: unit.id, attackedCardId: attackedCard.id, isRangeAttack: false, abilitiesParams: {}});
        await attackCard.execute();
      } catch(e) {
        console.log(e);
      }
    }
    
    private async endTurn(gameId: EntityId, playerId: EntityId) {
      let endTurnUseCase = new EndTurnUseCase({gameId, endingTurnPlayerId: playerId});
      await endTurnUseCase.execute();
    }
    
    private findShortestPath(game: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto, unit: CardDto, ignoreTiles: ArrayPoint[]) {
      let shortestPath = new Array(100);
      let shortestPathUnit: CardDto;
    
      for (let enemyUnit of enemyPlayer.table) {
        const grid = this.createPFMap(game, enemyPlayer, ignoreTiles);
        const finder = new PF.AStarFinder();
        const path = finder.findPath(unit.x, unit.y, enemyUnit.x, enemyUnit.y, grid);
    
        if (path.length > 0 && path.length < shortestPath.length) {
          shortestPathUnit = enemyUnit;
          shortestPath = path;
        }
      }
    
      shortestPath.pop();
      shortestPath.shift();
    
      return {shortestPathUnit, shortestPath};
    }
    
    private getAdjacentUnit(game: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto, unit: CardDto) {
      let adjacentUnit = null;
    
      for (let enemyUnit of enemyPlayer.table) {
        if (this.checkUnitsAdjacency(unit, enemyUnit)) {
          adjacentUnit = enemyUnit;
        }
      }
    
      return adjacentUnit;
    }
    
    private createPFMap(game: GameDto, enemyPlayer: PlayerDto, ignoreTiles) {
      const grid = new PF.Grid([
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]);
    
      for (let area of game.areas) {
        if (area.type !== "windWall") {
          grid.setWalkableAt(area.x, area.y, false);
        }
      }
    
      for (let point of ignoreTiles) {
        grid.setWalkableAt(point[0], point[1], false);
      }
    
      return grid;
    }
    
    private createMap(game: GameDto, currentPlayer: PlayerDto, enemyPlayer: PlayerDto) {
      const grid = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ];
    
      for (let area of game.areas) {
        if (area.type !== "windWall") {
          grid[area.x][area.y] = 1;
        }
      }
    
      for (let unit of currentPlayer.table) {
        grid[unit.x][unit.y] = 1;
      }
    
      for (let unit of enemyPlayer.table) {
        grid[unit.x][unit.y] = 1;
        grid[unit.x + 1][unit.y] = 1;
        grid[unit.x - 1][unit.y] = 1;
        grid[unit.x][unit.y + 1] = 1;
        grid[unit.x][unit.y - 1] = 1;
      }

    
      return grid;
    }
    
    private checkUnitsAdjacency(firstCard: CardDto, secondCard: CardDto) {
      let xDistance = Math.abs(firstCard.x - secondCard.x);
      let yDistance = Math.abs(firstCard.y - secondCard.y);
    
      if (xDistance + yDistance < 2) {
        return true;
      }
    
      return false;
    }

    private isAIName(deckName: string) {
        return deckName.startsWith("AI");
    }

    private async wait(ms) {
        return new Promise<void>((res, rej) => setTimeout(() => res(), ms));
    }
}

export { AiService }
