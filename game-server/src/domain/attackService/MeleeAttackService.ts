import { Player, CardStack } from '../Player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';

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
    let isAttackedCardRetaliation = !(attackedCard.abilities.range);

    if (isAttackerCardHaveFirstStrike && isAttackedCardHaveFirstStrike ||
      !isAttackerCardHaveFirstStrike && !isAttackedCardHaveFirstStrike ||
      !isAttackedCardRetaliation) {
      this.attackWithoutFirstStrike(attackerCard, attackedCard);
    } else {
      this.attackWithFirstStrike(attackerCard, attackedCard);
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

  private static attackWithoutFirstStrike (attackerCard: Card, attackedCard: Card): void {
    let attackerDmg = this.calcDamage(attackerCard, attackedCard);
    let attackedDmg = this.calcDamage(attackedCard, attackerCard);

    this.makeAttack(attackerCard, attackedCard, attackerDmg);

    let isAttackedCardRetaliation = !(attackedCard.abilities.range) && !(attackerCard.abilities.noEnemyRetaliation);

    if (isAttackedCardRetaliation) {
      this.makeAttack(attackedCard, attackerCard, attackedDmg);
    }
  }

  // Напоминаю, что в этом методе isAttackedCardRetaliation не может быть false
  private static attackWithFirstStrike (attackerCard: Card, attackedCard: Card): void {
    let isAttackerCardHaveFirstStrike = !!(attackerCard.abilities.firstStrike);
    let isAttackedCardHaveFirstStrike = !!(attackedCard.abilities.firstStrike);

    let firstAttacker = isAttackerCardHaveFirstStrike ? attackerCard : attackedCard;
    let secondAttacker = isAttackedCardHaveFirstStrike ? attackerCard : attackedCard;

    let firstAttackerDmg = this.calcDamage(firstAttacker, secondAttacker);
    let secondAttackerDmg = this.calcDamage(secondAttacker, firstAttacker);

    this.makeAttack(firstAttacker, secondAttacker, firstAttackerDmg);

    if (secondAttacker.alive) {
      this.makeAttack(secondAttacker, firstAttacker, secondAttackerDmg);
    }
  }

  public static calcDamage (attackerCard: Card, attackedCard: Card): number {
    let attackerDmg = attackerCard.damage - attackedCard.armor;

    attackerDmg = attackerDmg >= 0 ? attackerDmg : 0;

    return attackerDmg;
  }

  private static makeAttack (attackerCard: Card, attackedCard: Card, attackerDmg: number) {
    if (attackerCard.abilities.vampiric) {
      this.drainHP(attackerCard, attackedCard, attackerDmg);
    }
    attackedCard.takeDamage(attackerDmg);
  }

  private static drainHP (attackerCard: Card, attackedCard: Card, attackerDmg: number) {
    let attackerCardVampiricPower = attackerDmg;

    let attackerCardVampiredHP = attackedCard.currentHp >= attackerCardVampiricPower ?
      attackerCardVampiricPower : attackedCard.currentHp;

    attackerCard.overheal(attackerCardVampiredHP);
  }
}

export {MeleeAttackService};
