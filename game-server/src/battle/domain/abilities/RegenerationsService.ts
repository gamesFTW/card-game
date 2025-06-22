import { Card } from '../card/Card';

class RegenerationsService {
  public static regenerateUnits (playerTableCards: Card[]): void {
    for (let card of playerTableCards) {
      if (card.abilities.regeneration) {
        card.healed(card.abilities.regeneration.regeneration);
      }
    }
  }
}

export {RegenerationsService};
