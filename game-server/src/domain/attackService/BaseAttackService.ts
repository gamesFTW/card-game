import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { Point } from '../../infr/Point';
import { Area } from '../area/Area';
import { DomainError } from '../../infr/DomainError';

class BaseAttackService {
  public static calcDamage (attackerCard: Card, attackedCard: Card, attackedPlayerTableCards: Card[], board: Board, isAttackerFlankAttacked: boolean = false): number {
    let attackerFlankingBonus = 0;
    if (isAttackerFlankAttacked) {
      attackerFlankingBonus = attackerCard.abilities.flanking.damage;
    }

    let attackerDmg = (attackerCard.damage + attackerFlankingBonus) - attackedCard.armor;

    attackerDmg = attackerDmg >= 0 ? attackerDmg : 0;

    if (attackerDmg > 0) {
      attackerDmg = this.tryBlockDamage(attackerDmg, attackedCard, attackedPlayerTableCards, board);
    }

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

  private static tryBlockDamage (attackerDmg: number, attackedCard: Card, attackedPlayerTableCards: Card[], board: Board): number {
    let cardsWithBlockAbility = attackedPlayerTableCards.filter(card => card.abilities.block && !card.abilities.block.usedInThisTurn);

    let cardsWhoCanBlock = [];
    for (let card of cardsWithBlockAbility) {
      let distance = board.calcDistanceBetweenUnits(attackedCard, card);

      if (card.abilities.block.range >= distance) {
        cardsWhoCanBlock.push(card);
      }
    }

    for (let card of cardsWhoCanBlock) {
      if (attackerDmg > 0) {
        attackerDmg -= card.abilities.block.blockingDamage;
        card.block();
      } else {
        return 0;
      }
    }

    return attackerDmg;
  }
}

export {BaseAttackService};
