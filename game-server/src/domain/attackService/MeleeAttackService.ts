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
    let attackerDmg = attackerCard.damage;
    let attackedDmg = attackedCard.damage;

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

    let firstAttackerDmg = firstAttacker.damage;
    let secondAttackerDmg = secondAttacker.damage;

    secondAttacker.takeDamage(firstAttackerDmg);

    let secondAttackerRetaliation = !(secondAttacker.abilities.range);

    if (secondAttacker.alive && secondAttackerRetaliation) {
      firstAttacker.takeDamage(secondAttackerDmg);
    }
  }
}

export {MeleeAttackService};
