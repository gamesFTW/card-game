import Bresenham from '../Bresenham';
import { Card } from '../../card/Card';
import { Player } from '../../player/Player';
import { Board } from '../Board';
import { Point } from '../../../infr/Point';

export function checkCanRangeAttackTo (
  attackerCard: Card, attackedCard: Card, attackedPlayer: Player, board: Board, attackedPlayerTableCards: Card[]): boolean {
  const attackerCardPosition = board.getPositionByUnit(attackerCard);
  const attackedCardPosition = board.getPositionByUnit(attackedCard);

  let path: Point[] = Bresenham.plot(attackerCardPosition, attackedCardPosition);

  const range = attackerCard.abilities.range.range;

  if (path.length > range) {
    throw new Error(`Unit ${attackerCard.id} can't reach unit ${attackedCard.id} in range attack.`);
  }

  let attackedPlayerTableCardsMap: any = {};
  for (let card of attackedPlayerTableCards) {
    attackedPlayerTableCardsMap[card.id] = card;
  }

  let blockersOfRangeAttack = [];
  for (let point of path) {
    const cardId = board.getCardIdByPosition(point);

    if (attackedPlayerTableCardsMap[cardId]) {
      blockersOfRangeAttack.push(attackedPlayerTableCardsMap[cardId]);
    }
  }

  if (blockersOfRangeAttack.length > 0) {
    throw new Error(`Unit ${attackerCard.id} can\'t attack unit ${attackedCard.id}. There is cards on path: ${blockersOfRangeAttack.join(', ')}`);
  } else {
    return true;
  }
}
