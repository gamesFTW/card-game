import { Player, CardStack } from '../player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { Point } from '../../infr/Point';

interface AbilitiesParams {
  attackedPushAttackedAt: Point;
}

class MeleeAttackService {
  public static meleeAttackUnit (
      attackerCard: Card, attackedCard: Card, attackerPlayer: Player, attackedPlayer: Player,
      board: Board, attackerPlayerTableCards: Card[], attackedPlayerTableCards: Card[], abilitiesParams: AbilitiesParams): void {
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

    let isAttackerFlankAttacked = false;
    if (attackerCard.abilities.flanking) {
      isAttackerFlankAttacked = this.checkIsAttackerFlankAttacked(attackerCard, attackedCard, board, attackerPlayerTableCards);
    }

    let attackerDmg = this.calcDamage(attackerCard, attackedCard, isAttackerFlankAttacked);
    let attackedDmg = this.calcDamage(attackedCard, attackerCard);

    if (isAttackerCardHaveFirstStrike && isAttackedCardHaveFirstStrike ||
      !isAttackerCardHaveFirstStrike && !isAttackedCardHaveFirstStrike ||
      !isAttackedCardRetaliation) {
      this.attackWithoutFirstStrike(attackerCard, attackedCard, attackerDmg, attackedDmg);
    } else {
      this.attackWithFirstStrike(attackerCard, attackedCard, attackerDmg, attackedDmg);
    }

    if (attackerCard.abilities.piercing) {
      this.makePiercingAttack(attackerCard, attackedCard, attackerPlayer, attackedPlayer, board, attackedPlayerTableCards);
    }

    if (attackerCard.abilities.push && abilitiesParams.attackedPushAttackedAt) {
      this.pushAttackedCard(attackerCard, attackedCard, board, abilitiesParams.attackedPushAttackedAt);
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

  private static attackWithoutFirstStrike (attackerCard: Card, attackedCard: Card, attackerDmg: number, attackedDmg: number): void {
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
  private static attackWithFirstStrike (attackerCard: Card, attackedCard: Card, attackerDmg: number, attackedDmg: number): void {
    let isAttackerCardHaveFirstStrike = !!(attackerCard.abilities.firstStrike);
    let isAttackedCardHaveFirstStrike = !!(attackedCard.abilities.firstStrike);

    let firstAttacker = isAttackerCardHaveFirstStrike ? attackerCard : attackedCard;
    let secondAttacker = isAttackedCardHaveFirstStrike ? attackerCard : attackedCard;

    let firstAttackerDmg = isAttackerCardHaveFirstStrike ? attackerDmg : attackedDmg;
    let secondAttackerDmg = isAttackedCardHaveFirstStrike ? attackerDmg : attackedDmg;

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
    let piercingTargetCardId = board.getCardIdBehindSecondCard(attackerCard, attackedCard);

    if (piercingTargetCardId) {
      let piercingTargetCard: Card;
      for (let card of attackedPlayerTableCards) {
        if (card.id === piercingTargetCardId) {
          piercingTargetCard = card;
        }
      }

      if (piercingTargetCard) {
        let attackerDmg = this.calcDamage(attackerCard, piercingTargetCard);

        piercingTargetCard.takeDamage(attackerDmg);

        if (!piercingTargetCard.alive) {
          attackedPlayer.endOfCardDeath(piercingTargetCard);
          board.removeUnitFromBoard(piercingTargetCard);
        }
      }
    }
  }

  // tslint:disable-next-line:member-ordering
  public static calcDamage (attackerCard: Card, attackedCard: Card, isAttackerFlankAttacked: boolean = false): number {
    let attackerFlankingBonus = 0;
    if (isAttackerFlankAttacked) {
      attackerFlankingBonus = attackerCard.abilities.flanking.damage;
    }

    let attackerDmg = (attackerCard.damage + attackerFlankingBonus) - attackedCard.armor;

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

  private static checkIsAttackerFlankAttacked (attackerCard: Card, attackedCard: Card, board: Board, attackerPlayerTableCards: Card[]): boolean {
    let flankerSupportCardId = board.getCardIdBehindSecondCard(attackerCard, attackedCard);

    if (flankerSupportCardId) {
      let flankerSupportCard: Card;
      for (let card of attackerPlayerTableCards) {
        if (card.id === flankerSupportCardId) {
          flankerSupportCard = card;
        }
      }

      if (flankerSupportCard) {
        return true;
      }
    }

    return false;
  }

  private static pushAttackedCard (attackerCard: Card, attackedCard: Card, board: Board, pushPosition: Point): void {
    let attackedCardPosition = board.getPositionByUnit(attackedCard);

    let distanceX = attackedCardPosition.x - pushPosition.x;
    let distanceY = attackedCardPosition.y - pushPosition.y;

    let pushDistance = Math.abs(distanceX) + Math.abs(distanceY);

    if (pushDistance > attackerCard.abilities.push.range) {
      throw new Error(`Card ${attackerCard.id} cant push ${attackedCard.id} at x: ${pushPosition.x} y: ${pushPosition.y}`);
    }

    board.moveUnit(attackedCard, pushPosition);
  }
}

export {MeleeAttackService, AbilitiesParams};
