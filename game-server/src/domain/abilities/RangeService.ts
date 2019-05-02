import { Card } from '../card/Card';
import { Board } from '../board/Board';

class RangeService {
  public static applyBlockForRangeUnits (playerTableCards: Card[], opponentTableCards: Card[], board: Board): void {
    for (let card of playerTableCards) {
      if (card.abilities.range) {
        let isBlocked = this.checkIsBlocked(card, opponentTableCards, board);

        if (isBlocked) {
          card.blockRangeAbility();
        } else {
          if (card.abilities.range.blockedInBeginningOfTurn) {
            card.unblockRangeAbility();
          }
        }
      }
    }
  }

  private static checkIsBlocked (card: Card, opponentTableCards: Card[], board: Board): boolean {
    let isBlocked = false;
    for (let opponentCard of opponentTableCards) {
      isBlocked = board.checkUnitsAdjacency(card, opponentCard);
    }

    return isBlocked;
  }
}

export {RangeService};
