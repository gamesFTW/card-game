import { Card } from '../domain/card/Card';
import { Field } from '../domain/field/Field';

class DamageService {
  static cardAttackCard (attackingCard: Card, defendingCard: Card, field: Field) {
    let isCardsAdjacent = field.checkCardsAdjacency(attackingCard, defendingCard);
    if (!isCardsAdjacent) {
      throw new Error('Cards not adjacent.');
    }
    if (!attackingCard.alive) {
      throw new Error('Dead card cant attack.');
    }

    attackingCard.setAttackTarget(defendingCard);

    let attackingCardDamage = this.calcDamage(attackingCard, defendingCard);
    defendingCard.takeDamage(attackingCardDamage);

    if (defendingCard.alive) {
      let defendingCardDamage = this.calcDamage(defendingCard, attackingCard);
      attackingCard.takeDamage(defendingCardDamage);
    }
  }

  static calcDamage (attackingCard: Card, defendingCard: Card) {
    let cardDamage = attackingCard.damage - defendingCard.armor;

    if (cardDamage < 0) {
      cardDamage = 0;
    }

    return cardDamage;
  }
}

export {DamageService};
