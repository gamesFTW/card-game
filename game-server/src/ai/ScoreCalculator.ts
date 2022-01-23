import { Game } from '../domain/game/Game';
import { Board } from '../domain/board/Board';
import { Area } from '../domain/area/Area';
import { Player } from '../domain/player/Player';
import { Card } from '../domain/card/Card';
import { GameSituation } from './MakeAITurnUseCase';
import { getEntitiesFromGameSituation, getEntityFromGameSituation } from './helpers';
import { EntityId } from '../infr/Entity';

type GameEntities = {
  game: Game;
  board: Board;
  areas: Area[];
  currentPlayer: Player;
  opponentPlayer: Player;
  currentPlayerTableCards: Card[];
  opponentPlayerTableCards: Card[];
}

// Скор должен расчитываться в начале хода активного игрока.
// И делается он для оценки хода ждущего игрока.
class ScoreCalculator {
  public calculationLog: string = "";

  execute(
    gameSituation: GameSituation, gameId: EntityId, activePlayerId: EntityId, waitingPlayerId: EntityId
  ): number {
    const game = getEntityFromGameSituation<Game>(gameId, gameSituation);
    const board = getEntityFromGameSituation<Board>(game.boardId, gameSituation);
    const areas = getEntitiesFromGameSituation<Area>(board.areas, gameSituation);
    const currentPlayer = getEntityFromGameSituation<Player>(activePlayerId, gameSituation);
    const opponentPlayer = getEntityFromGameSituation<Player>(waitingPlayerId, gameSituation);
    const currentPlayerTableCards = getEntitiesFromGameSituation<Card>(currentPlayer.table, gameSituation);
    const opponentPlayerTableCards = getEntitiesFromGameSituation<Card>(opponentPlayer.table, gameSituation);

    const gameEntitiesForCurrentPlayer: GameEntities = {
      game, board, areas, currentPlayer: currentPlayer, opponentPlayer: opponentPlayer,
      currentPlayerTableCards: currentPlayerTableCards, opponentPlayerTableCards: opponentPlayerTableCards
    };

    const gameEntitiesForOpponentPlayer: GameEntities = {
      game, board, areas, currentPlayer: opponentPlayer, opponentPlayer: currentPlayer,
      currentPlayerTableCards: opponentPlayerTableCards, opponentPlayerTableCards: currentPlayerTableCards
    };

    const activePlayerScore = this.calcScoreForCards(currentPlayerTableCards, gameEntitiesForCurrentPlayer);
    const waitingPlayerScore = this.calcScoreForCards(opponentPlayerTableCards, gameEntitiesForOpponentPlayer);

    return activePlayerScore - waitingPlayerScore;
  }

  calcScoreForCards(cards: Card[], gameEntities: GameEntities): number {
    return cards.reduce((previousValue: number, card: Card) => {
      return previousValue + this.calcScoreForCard(card, gameEntities);
    }, 0);
  }

  calcScoreForCard(card: Card, gameEntities: GameEntities): number {
    this.calculationLog += "\n" + card.toString() + " " + card.id + "\n";

    const hp = card.currentHp;
    const dmg = card.damage;

    let score = 0;

    if (card.hero) {
      score += 10;
    }

    score += (hp * 5);

    if (dmg == 1) {
      score += 5
    } else if (dmg == 2) {
      score += 15
    } else if (dmg == 3) {
      score += 40
    }

    //console.log("Base score: " + score);

    if (card.abilities.range) {
      if (card.abilities.range.blockedInBeginningOfTurn) {
        this.calculationLog += 'Blocked' + "\n";
        score /= 2;
      } else {
        const penalty = this.calcPenaltyOfRangeUnitForDistanceToNearestEnemy(card, gameEntities);
        this.calculationLog += 'Range penalty: ' + penalty + "\n";
        score /= penalty;
      }
    } else {
      const penalty = this.calcPenaltyOfMeleeUnitForDistanceToNearestEnemy(card, gameEntities);
      this.calculationLog += 'Melee penalty: ' + penalty + "\n";
      score /= penalty;
    }

    this.calculationLog += "Final score: " + score + "\n";
    return score;
  }

  calcPenaltyOfMeleeUnitForDistanceToNearestEnemy(card: Card, gameEntities: GameEntities): number {
    const distanceToNearestEnemy = gameEntities.board.getNumberOfMovementsToNearestEnemy(
      card, gameEntities.opponentPlayer, gameEntities.areas
    );

    // Чем дальше от врага, тем сильнее штраф
    let distanceAfterMovement = distanceToNearestEnemy - card.speed;

    if (distanceAfterMovement < 0) {
      return 1;
    } else {
      return 1 + (distanceAfterMovement / 10);
    }
  }

  calcPenaltyOfRangeUnitForDistanceToNearestEnemy(card: Card, gameEntities: GameEntities): number {
    let toCloseToEnemyPenalty = 0;
    let toFarFromEnemyPenalty = 0;

    const distanceToNearestEnemy = gameEntities.board.getNumberOfMovementsToNearestEnemy(
      card, gameEntities.opponentPlayer, gameEntities.areas
    );

    this.calculationLog += "distanceToNearestEnemy: " + distanceToNearestEnemy + "\n";

    // TODO: учитывать скорость врага. Сейчас берется Card.DEFAULT_MOVING_POINTS

    let distanceAfterEnemyMovement = distanceToNearestEnemy - Card.DEFAULT_MOVING_POINTS;

    if (distanceAfterEnemyMovement <= 0) {
      // Штрафуем если враг может дойти за один ход
      toCloseToEnemyPenalty = 0.3;
    }


    const enemies = gameEntities.board.getEnemiesForRangeAttackOfCard(
      card, gameEntities.opponentPlayerTableCards, gameEntities.areas
    );

    // Штрафуем если врага нет в зоне досягаемости
    if (enemies.length == 0) {
      // Вообще тут надо штрафовать за расстояние до ближайшего места откуда можно выстрелить.
      // Но пока у меня тут очень плохая формула

      let distanceAfterMovement = distanceToNearestEnemy - card.speed - card.abilities.range.range + 1;

      this.calculationLog += "distanceAfterMovement: " + distanceAfterMovement + "\n";

      if (distanceAfterMovement < 0) {
        toFarFromEnemyPenalty = 0;
      } else {
        toFarFromEnemyPenalty = distanceAfterMovement / 10;
      }
    }

    this.calculationLog += "toCloseToEnemyPenalty: " + toCloseToEnemyPenalty + "\n";
    this.calculationLog += "toFarFromEnemyPenalty: " + toFarFromEnemyPenalty + "\n";

    return 1 + toCloseToEnemyPenalty + toFarFromEnemyPenalty;
  }
}

export { ScoreCalculator }
