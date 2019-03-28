import { Board } from '../domain/board/Board';
import { Player } from '../domain/player/Player';
import { Card } from '../domain/card/Card';
import { canGoInRange } from './Path.helpers';

export function canRangeAttackTo (attackerCard: Card, attackedCard: Card,
  attackedPlayer: Player, board: Board): boolean {
  const grid = board.getPFGrid(attackedPlayer);
  const attackerCardPostion = board.getPositionByUnit(attackerCard);
  const attackedCardPostion = board.getPositionByUnit(attackedCard);
  const range = attackerCard.abilities['range'].range;
  return canGoInRange(attackerCardPostion, attackedCardPostion, range, grid);
}
