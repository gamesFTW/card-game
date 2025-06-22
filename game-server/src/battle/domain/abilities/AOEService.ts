import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { Point } from '../../infr/Point';
import { getCardsByIds } from '../card/getCardById';
import { BaseAttackService } from '../attackService/BaseAttackService';

class AOEService {
  public static attackAOETargets (attackerCard: Card, attackedCard: Card, attackedPlayerTableCards: Card[], board: Board): void {
    let attackerCardPosition = board.getPositionOfUnit(attackedCard);

    let aoePoints: Point[];
    if (attackerCard.abilities.aoe.diagonal) {
      aoePoints = board.findPointsInSquareRadius(attackerCardPosition, attackerCard.abilities.aoe.range);
    } else {
      aoePoints = board.findPointsInRadius(attackerCardPosition, attackerCard.abilities.aoe.range);
    }

    aoePoints.shift();

    let aoeTargetsIds = [];
    for (let point of aoePoints) {
      let unitId = board.getUnitIdByPosition(point);

      if (unitId) {
        aoeTargetsIds.push(unitId);
      }
    }

    let aoeTargetCards = getCardsByIds(attackedPlayerTableCards, aoeTargetsIds);

    for (let aoeTargetCard of aoeTargetCards) {
      let attackerDmg = BaseAttackService.calcDamage(attackerCard, aoeTargetCard, attackedPlayerTableCards, board);
      aoeTargetCard.takeDamage(attackerDmg);
    }
  }
}

export {AOEService};
