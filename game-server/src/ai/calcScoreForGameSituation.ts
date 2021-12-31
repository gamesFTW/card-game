import { InMemoryRepository } from '../infr/repositories/InMemoryRepository';
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
  activePlayer: Player;
  waitingPlayer: Player;
  activePlayerTableCards: Card[];
  waitingPlayerTableCards: Card[];
}

function calcScoreForGameSituation(
  gameSituation: GameSituation, gameId: EntityId, activePlayerId: EntityId, waitingPlayerId: EntityId
): number {
  const game = getEntityFromGameSituation<Game>(gameId, gameSituation);
  const board = getEntityFromGameSituation<Board>(game.boardId, gameSituation);
  const areas = getEntitiesFromGameSituation<Area>(board.areas, gameSituation);
  const activePlayer = getEntityFromGameSituation<Player>(activePlayerId, gameSituation);
  const waitingPlayer = getEntityFromGameSituation<Player>(waitingPlayerId, gameSituation);
  const activePlayerTableCards = getEntitiesFromGameSituation<Card>(activePlayer.table, gameSituation);
  const waitingPlayerTableCards = getEntitiesFromGameSituation<Card>(waitingPlayer.table, gameSituation);

  const gameEntities: GameEntities = {
    game, board, areas, activePlayer, waitingPlayer, activePlayerTableCards, waitingPlayerTableCards
  };

  const activePlayerScore = calcScoreForCards(activePlayerTableCards, gameEntities);
  const waitingPlayerScore = calcScoreForCards(waitingPlayerTableCards, gameEntities);

  return activePlayerScore - waitingPlayerScore;
}

function calcScoreForCards(cards: Card[], gameEntities: GameEntities): number {
  return cards.reduce((previousValue: number, card: Card) => {
    return previousValue + calcScoreForCard(card, gameEntities);
  }, 0);
}

function calcScoreForCard(card: Card, gameEntities: GameEntities): number {
  const hp = card.currentHp;
  const dmg = card.damage;

  let score = 0;

  if (card.hero) {
    score += 10;
  }

  score += (hp * 5);

  if (dmg == 1) {score += 5}
  else if (dmg == 2) {score += 15}
  else if (dmg == 2) {score += 40}

  if (card.abilities.range) {
    if (card.abilities.range.blockedInBeginningOfTurn) {
      score -= 10;
    } else {
      score -= calcPenaltyOfRangeUnitForDistanceToNearestEnemy(card, gameEntities);
    }
  } else {
    score -= calcPenaltyOfMeleeUnitForDistanceToNearestEnemy(card, gameEntities);
  }

  console.log(card.toString());
  console.log(score);
  return score;
}

function calcPenaltyOfMeleeUnitForDistanceToNearestEnemy(card: Card, gameEntities: GameEntities): number {
  const distanceToNearestEnemy = gameEntities.board.getNumberOfMovementsToNearestEnemy(
    card, gameEntities.waitingPlayer, gameEntities.areas
  );

  let distanceAfterMovement = distanceToNearestEnemy - card.speed;

  if (distanceAfterMovement < 0) {
    return 0;
  } else {
    return distanceToNearestEnemy;
  }
}

function calcPenaltyOfRangeUnitForDistanceToNearestEnemy(card: Card, gameEntities: GameEntities): number {
  const distanceToNearestEnemy = gameEntities.board.getNumberOfMovementsToNearestEnemy(
    card, gameEntities.waitingPlayer, gameEntities.areas
  );

  // TODO: учитывать скорость врага. Сейчас берется Card.DEFAULT_MOVING_POINTS

  let distanceAfterMovement = distanceToNearestEnemy - Card.DEFAULT_MOVING_POINTS;

  if (distanceAfterMovement <= 0) {
    return 5;
  }
}

export { calcScoreForGameSituation }
