import { Card } from '../card/Card';

class DamageCurseService {
  public static removeDamageCurse (playerTableCards: Card[]): void {
    for (let card of playerTableCards) {
      if (card.negativeEffects.damageCursed) {
        card.removeDamageCurse();
      }
    }
  }
}

export {DamageCurseService};
