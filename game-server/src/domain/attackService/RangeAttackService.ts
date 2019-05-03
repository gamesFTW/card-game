import { Player, CardStack } from '../player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { MeleeAttackService } from './MeleeAttackService';
import { RangeService } from '../abilities/RangeService';
import { Point } from '../../infr/Point';
import Bresenham from './Bresenham';

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

    if (!attackerCard.abilities.range) {
      throw new Error(`Card ${attackedCard.id} dont have range ability`);
    }

    if (attackerCard.abilities.range.blockedInBeginningOfTurn) {
      throw new Error(`Card ${attackedCard.id} can't range attack because blocked in beginning of turn`);
    }

    let isBlocked = RangeService.checkIsBlocked(attackerCard, attackedPlayerTableCards, board);
    if (isBlocked) {
      throw new Error(`Card ${attackedCard.id} can't range attack because blocked by enemy unit`);
    }

    this.checkCanRangeAttackTo(attackerCard, attackedCard, attackedPlayer, board, attackedPlayerTableCards);

    attackerCard.tap();

    let attackerDmg = MeleeAttackService.calcDamage(attackerCard, attackedCard);

    attackedCard.takeDamage(attackerDmg);

    if (!attackedCard.alive) {
      attackedPlayer.endOfCardDeath(attackedCard);
      board.removeUnitFromBoard(attackedCard);
    }
  }

  private static checkCanRangeAttackTo (
    attackerCard: Card, attackedCard: Card, attackedPlayer: Player, board: Board, attackedPlayerTableCards: Card[]): boolean {
    const attackerCardPosition = board.getPositionByUnit(attackerCard);
    const attackedCardPosition = board.getPositionByUnit(attackedCard);

    let path: Point[] = Bresenham.plot(attackerCardPosition, attackedCardPosition);

    const range = attackerCard.abilities.range.range;

    if (path.length > range) {
      throw new Error(`Unit ${attackerCard.id} can't reach unit ${attackedCard.id} in range attack.`);
    }

    let attackedPlayerTableCardsMap: any = {};
    for (let card of attackedPlayerTableCards) {
      attackedPlayerTableCardsMap[card.id] = card;
    }

    let blockersOfRangeAttack = [];
    for (let point of path) {
      const cardId = board.getCardIdByPosition(point);

      if (attackedPlayerTableCardsMap[cardId]) {
        blockersOfRangeAttack.push(attackedPlayerTableCardsMap[cardId]);
      }
    }

    if (blockersOfRangeAttack.length > 0) {
      throw new Error(`Unit ${attackerCard.id} can\'t attack unit ${attackedCard.id}. There is cards on path: ${blockersOfRangeAttack.join(', ')}`);
    } else {
      return true;
    }
  }
}

export {RangeAttackService};
