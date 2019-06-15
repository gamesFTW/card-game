import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { Point } from '../../infr/Point';
import { Area } from '../area/Area';
import { DomainError } from '../../infr/DomainError';

class BaseAttackService {
  public static calcDamage (attackerCard: Card, attackedCard: Card, isAttackerFlankAttacked: boolean = false): number {
    let attackerFlankingBonus = 0;
    if (isAttackerFlankAttacked) {
      attackerFlankingBonus = attackerCard.abilities.flanking.damage;
    }

    let attackerDmg = (attackerCard.damage + attackerFlankingBonus) - attackedCard.armor;

    attackerDmg = attackerDmg >= 0 ? attackerDmg : 0;

    return attackerDmg;
  }

  public static pushAttackedCard (attackerCard: Card, attackedCard: Card, board: Board, pushPosition: Point, areas: Area[]): void {
    let attackedCardPosition = board.getPositionOfUnit(attackedCard);

    let distanceX = attackedCardPosition.x - pushPosition.x;
    let distanceY = attackedCardPosition.y - pushPosition.y;

    let pushDistance = Math.abs(distanceX) + Math.abs(distanceY);

    if (pushDistance > attackerCard.abilities.push.range) {
      throw new DomainError(`Card ${attackerCard.id} cant push ${attackedCard.id} at x: ${pushPosition.x} y: ${pushPosition.y}`);
    }

    board.moveUnit(attackedCard, pushPosition, areas);
  }
}

export {BaseAttackService};
