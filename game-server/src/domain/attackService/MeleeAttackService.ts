import { Player, CardStack } from '../player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { AbilitiesParams } from '../../app/player/AttackCardUseCase';
import { Area } from '../area/Area';
import { DomainError } from '../../infr/DomainError';
import { BaseAttackService } from './BaseAttackService';

class MeleeAttackService {
  public static meleeAttackUnit (
      attackerCard: Card, attackedCard: Card, attackerPlayer: Player, attackedPlayer: Player,
      board: Board, attackerPlayerTableCards: Card[], attackedPlayerTableCards: Card[], areas: Area[], abilitiesParams: AbilitiesParams): void {
    attackerPlayer.checkIfItHisTurn();

    if (!attackerPlayer.checkCardIn(attackerCard, CardStack.TABLE)) {
      throw new DomainError(`Card ${attackerCard.id} is not in table stack`);
    }

    if (!attackedPlayer.checkCardIn(attackedCard, CardStack.TABLE)) {
      throw new DomainError(`Card ${attackedCard.id} is not in table stack`);
    }

    if (!board.checkUnitsAdjacency(attackerCard, attackedCard)) {
      throw new DomainError(`Card ${attackerCard.id} is not near ${attackedCard.id}`);
    }

    attackerCard.tap();

    let isAttackerCardHaveFirstStrike = !!(attackerCard.abilities.firstStrike);
    let isAttackedCardHaveFirstStrike = !!(attackedCard.abilities.firstStrike);
    let isAttackedCardRetaliation = this.calcRetaliation(attackerCard, attackedCard);

    let isAttackerFlankAttacked = false;
    if (attackerCard.abilities.flanking) {
      isAttackerFlankAttacked = this.checkIsAttackerFlankAttacked(attackerCard, attackedCard, board, attackerPlayerTableCards);
    }

    let attackerDmg = BaseAttackService.calcDamage(attackerCard, attackedCard, attackedPlayerTableCards, board, isAttackerFlankAttacked);
    let attackedDmg = BaseAttackService.calcDamage(attackedCard, attackerCard, attackerPlayerTableCards, board);

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

    if (attackerCard.abilities.push && abilitiesParams.pushAt) {
      BaseAttackService.pushAttackedCard(attackerCard, attackedCard, board, abilitiesParams.pushAt, areas);
    }

    if (attackerCard.abilities.bash && !attackedCard.tapped) {
      attackedCard.tap();
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

    BaseAttackService.checkForVampiricAndDrainHP(attackerCard, attackedCard, attackerDmg);

    if (isAttackedCardRetaliation) {
      BaseAttackService.checkForVampiricAndDrainHP(attackedCard, attackerCard, attackedDmg);
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

    BaseAttackService.checkForVampiricAndDrainHP(firstAttacker, secondAttacker, firstAttackerDmg);
    secondAttacker.takeDamage(firstAttackerDmg);

    if (secondAttacker.alive) {
      BaseAttackService.checkForVampiricAndDrainHP(secondAttacker, firstAttacker, secondAttackerDmg);
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
        let attackerDmg = BaseAttackService.calcDamage(attackerCard, piercingTargetCard, attackedPlayerTableCards, board);

        piercingTargetCard.takeDamage(attackerDmg);

        if (!piercingTargetCard.alive) {
          attackedPlayer.endOfCardDeath(piercingTargetCard);
          board.removeUnitFromBoard(piercingTargetCard);
        }
      }
    }
  }

  private static calcRetaliation (attackerCard: Card, attackedCard: Card): boolean {
    return !(attackedCard.abilities.range) && !(attackerCard.abilities.noEnemyRetaliation);
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
}

export {MeleeAttackService};
