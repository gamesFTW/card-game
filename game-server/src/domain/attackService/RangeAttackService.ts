import { Player, CardStack } from '../player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { MeleeAttackService } from './MeleeAttackService';
import { checkCanRangeAttackTo } from '../board/Path/Attack';

class RangeAttackService {
  public static rangeAttackUnit (
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

    // TODO: проверить нет ли врагов рядом
    // if (!board.checkUnitsAdjacency(attackerCard, attackedCard)) {
    //   throw new Error(`Card ${attackerCard.id} is not near ${attackedCard.id}`);
    // }

    if (!attackerCard.abilities.range) {
      throw new Error(`Card ${attackedCard.id} dont have range ability`);
    }

    checkCanRangeAttackTo(attackerCard, attackedCard, attackedPlayer, board, attackedPlayerTableCards);

    attackerCard.tap();

    let attackerDmg = MeleeAttackService.calcDamage(attackerCard, attackedCard);

    attackedCard.takeDamage(attackerDmg);

    if (!attackedCard.alive) {
      attackedPlayer.endOfCardDeath(attackedCard);
      board.removeUnitFromBoard(attackedCard);
    }
  }
}

export {RangeAttackService};
