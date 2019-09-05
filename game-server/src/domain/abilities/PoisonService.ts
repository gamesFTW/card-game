import { Card } from '../card/Card';
import { Player } from '../player/Player';
import { Board } from '../board/Board';

class PoisonService {
  public static inflictPoisonDamage (playerTableCards: Card[], player: Player, board: Board): void {
    for (let card of playerTableCards) {
      if (card.negativeEffects.poisoned) {
        card.takeDamage(card.negativeEffects.poisoned.damage);
        card.removePoison();

        if (!card.alive) {
          player.endOfCardDeath(card);
          board.removeUnitFromBoard(card);
        }
      }
    }
  }
}

export {PoisonService};
