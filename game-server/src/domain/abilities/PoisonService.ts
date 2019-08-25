import { Card } from '../card/Card';

class PoisonService {
  public static inflictPoisonDamage (playerTableCards: Card[]): void {
    for (let card of playerTableCards) {
      if (card.negativeEffects.poisoned) {
        card.takeDamage(card.negativeEffects.poisoned.damage);
        card.removePoison();
      }
    }
  }
}

export {PoisonService};
