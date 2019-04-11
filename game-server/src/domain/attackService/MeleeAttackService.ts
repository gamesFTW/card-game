import { Player, CardStack } from '../player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { Point } from '../../infr/Point';

class MeleeAttackService {
  public static meleeAttackUnit (
      attackerCard: Card, attackedCard: Card,
      attackerPlayer: Player, attackedPlayer: Player,
      board: Board, attackedPlayerTableCards: Card[]): void {
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
    let isAttackedCardRetaliation = this.calcRetaliation(attackerCard, attackedCard);

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

    if (attackerCard.abilities.piercing) {
      this.makePiercingAttack(attackerCard, attackedCard, attackerPlayer, attackedPlayer, board, attackedPlayerTableCards);
    }
  }

  private static attackWithoutFirstStrike (attackerCard: Card, attackedCard: Card): void {
    let attackerDmg = this.calcDamage(attackerCard, attackedCard);
    let attackedDmg = this.calcDamage(attackedCard, attackerCard);

    let isAttackedCardRetaliation = this.calcRetaliation(attackerCard, attackedCard);

    this.checkForVampiricAndDrainHP(attackerCard, attackedCard, attackerDmg);

    if (isAttackedCardRetaliation) {
      this.checkForVampiricAndDrainHP(attackedCard, attackerCard, attackedDmg);
    }

    attackedCard.takeDamage(attackerDmg);

    if (isAttackedCardRetaliation) {
      attackerCard.takeDamage(attackedDmg);
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

    this.checkForVampiricAndDrainHP(firstAttacker, secondAttacker, firstAttackerDmg);
    secondAttacker.takeDamage(firstAttackerDmg);

    if (secondAttacker.alive) {
      this.checkForVampiricAndDrainHP(secondAttacker, firstAttacker, secondAttackerDmg);
      firstAttacker.takeDamage(secondAttackerDmg);
    }
  }

  // Здесь намеренно не написан vamparic логика, мы решили что vamparic не должен работать с piercing
  private static makePiercingAttack (
    attackerCard: Card, attackedCard: Card,
    attackerPlayer: Player, attackedPlayer: Player,
    board: Board, attackedPlayerTableCards: Card[]): void {
    let attackerCardPosition: Point = board.getPositionByUnit(attackerCard);
    let attackedCardPosition: Point = board.getPositionByUnit(attackedCard);

    let piercingCandidateX = attackedCardPosition.x + (attackedCardPosition.x - attackerCardPosition.x);
    let piercingCandidateY = attackedCardPosition.y + (attackedCardPosition.y - attackerCardPosition.y);

    let piercingCandidatePosition: Point = new Point(piercingCandidateX, piercingCandidateY);
    let piercingTargetCardId = board.getCardIdByPosition(piercingCandidatePosition);

    if (piercingTargetCardId) {
      let piercingTargetCard: Card;
      for (let card of attackedPlayerTableCards) {
        if (card.id === piercingTargetCardId) {
          piercingTargetCard = card;
        }
      }

      let attackerDmg = this.calcDamage(attackerCard, piercingTargetCard);

      piercingTargetCard.takeDamage(attackerDmg);

      if (!piercingTargetCard.alive) {
        attackedPlayer.endOfCardDeath(piercingTargetCard);
        board.removeUnitFromBoard(piercingTargetCard);
      }
    }
  }

  // tslint:disable-next-line:member-ordering
  public static calcDamage (attackerCard: Card, attackedCard: Card): number {
    let attackerDmg = attackerCard.damage - attackedCard.armor;

    attackerDmg = attackerDmg >= 0 ? attackerDmg : 0;

    return attackerDmg;
  }

  // tslint:disable-next-line:member-ordering
  public static calcRetaliation (attackerCard: Card, attackedCard: Card): boolean {
    return !(attackedCard.abilities.range) && !(attackerCard.abilities.noEnemyRetaliation);
  }

  private static checkForVampiricAndDrainHP (attackerCard: Card, attackedCard: Card, attackerDmg: number): void {
    if (attackerCard.abilities.vampiric) {
      this.drainHP(attackerCard, attackedCard, attackerDmg);
    }
  }

  private static drainHP (attackerCard: Card, attackedCard: Card, attackerDmg: number): void {
    let attackerCardVampiricPower = attackerDmg;

    let attackerCardVampiredHP = attackedCard.currentHp >= attackerCardVampiricPower ?
      attackerCardVampiricPower : attackedCard.currentHp;

    attackerCard.overheal(attackerCardVampiredHP);
  }
}

export {MeleeAttackService};
