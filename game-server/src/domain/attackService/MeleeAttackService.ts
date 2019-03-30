import { Player, CardStack } from '../Player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { canRangeAttackTo } from '../../infr/Attack';

class MeleeAttackService {
  public static meleeAttackUnit (
      attackerCard: Card, attackedCard: Card,
      attackerPlayer: Player, attackedPlayer: Player,
      board: Board): void {
    attackerPlayer.checkIfItHisTurn();

    if (!attackerPlayer.checkCardIn(attackerCard, CardStack.TABLE)) {
      throw new Error(`Card ${attackerCard.id} is not in table stack`);
    }

    if (!attackedPlayer.checkCardIn(attackedCard, CardStack.TABLE)) {
      throw new Error(`Card ${attackedCard.id} is not in table stack`);
    }

    if (!board.checkUnitsAdjacency(attackerCard, attackedCard)) {
      throw new Error(`Card ${attackerCard.id} is not near ${attackedCard.id}`);
    }

    attackerCard.tap();

    let isAttackerCardHaveFirstStrike = !!(attackerCard.abilities.firstStrike);
    let isAttackedCardHaveFirstStrike = !!(attackedCard.abilities.firstStrike);

    if (isAttackerCardHaveFirstStrike && isAttackedCardHaveFirstStrike ||
      !isAttackerCardHaveFirstStrike && !isAttackedCardHaveFirstStrike) {
      this.attackWithoutFirstStrikeOrBothCardHaveFirstStrike(attackerCard, attackedCard);
    } else {
      this.attackWithOneCardHaveFirstStrike(attackerCard, attackedCard);
    }

    if (!attackedCard.alive) {
      attackedPlayer.endOfCardDeath(attackedCard);
      board.removeUnitFromBoard(attackedCard);
    }

    if (!attackerCard.alive) {
      attackerPlayer.endOfCardDeath(attackerCard);
      board.removeUnitFromBoard(attackerCard);
    }
  }

  private static attackWithoutFirstStrikeOrBothCardHaveFirstStrike (attackerCard: Card, attackedCard: Card): void {
    let isAttackedCardRetaliation = !(attackedCard.abilities.range);

    let attackerDmg = this.calcDamage(attackerCard, attackedCard);
    let attackedDmg = this.calcDamage(attackedCard, attackerCard);

    attackedCard.takeDamage(attackerDmg);

    if (isAttackedCardRetaliation) {
      attackerCard.takeDamage(attackedDmg);
    }
  }

  private static attackWithOneCardHaveFirstStrike (attackerCard: Card, attackedCard: Card): void {
    let isAttackerCardHaveFirstStrike = !!(attackerCard.abilities.firstStrike);
    let isAttackedCardHaveFirstStrike = !!(attackedCard.abilities.firstStrike);

    let firstAttacker = isAttackerCardHaveFirstStrike ? attackerCard : attackedCard;
    let secondAttacker = isAttackedCardHaveFirstStrike ? attackerCard : attackedCard;

    let firstAttackerDmg = this.calcDamage(firstAttacker, secondAttacker);
    let secondAttackerDmg = this.calcDamage(secondAttacker, firstAttacker);

    secondAttacker.takeDamage(firstAttackerDmg);

    let secondAttackerRetaliation = !(secondAttacker.abilities.range);

    if (secondAttacker.alive && secondAttackerRetaliation) {
      firstAttacker.takeDamage(secondAttackerDmg);
    }
  }

  public static calcDamage (attackerCard: Card, attackedCard: Card): number {
    let attackerDmg = attackerCard.damage - attackedCard.armor;

    attackerDmg = attackerDmg >= 0 ? attackerDmg : 0;

    return attackerDmg;
  }
}

export {MeleeAttackService};
