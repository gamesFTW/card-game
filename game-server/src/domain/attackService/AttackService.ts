import { Player, CardStack } from '../Player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';

class AttackService {
  static attackUnit (
      attackerCard: Card, attackedCard: Card,
      attackerPlayer: Player, attackedPlayer: Player,
      board: Board): void {
    attackerPlayer.checkIfItHisTurn();

    if (!board.checkUnitsAdjacency(attackerCard, attackedCard)) {
      throw new Error(`Card ${attackerCard.id} is not near ${attackedCard.id}`);
    }

    // TODO возможно нужен отдельный метод
    attackerCard.tap();
    if (!attackerPlayer.checkCardIn(attackerCard, CardStack.TABLE)) {
      throw new Error(`Card ${attackerCard.id} is not in table stack`);
    }

    if (!attackedPlayer.checkCardIn(attackedCard, CardStack.TABLE)) {
      throw new Error(`Card ${attackedCard.id} is not in table stack`);
    }

    let attackerDmg = attackerCard.damage;
    let attackedDmg = attackedCard.damage;

    attackedCard.takeDamage(attackerDmg);
    attackerCard.takeDamage(attackedDmg);

    if (!attackedCard.alive) {
      attackedPlayer.endOfCardDeath(attackedCard);
    }

    if (!attackerCard.alive) {
      attackerPlayer.endOfCardDeath(attackerCard);
    }
  }
}

export {AttackService};
