import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { Player } from '../player/Player';

class HPAuraService {
  public static buffHP (playerTableCards: Card[], player: Player, board: Board): void {
    let cardsWithHPAura = [];

    for (let card of playerTableCards) {
      if (card.abilities.hpAura) {
        cardsWithHPAura.push(card);
      }
    }

    if (cardsWithHPAura.length > 0) {
      for (let card of playerTableCards) {
        let hpAuraNewHp = 0;

        for (let cardWithHPAura of cardsWithHPAura) {
          if (cardWithHPAura !== card) {
            let distance = board.calcDistanceBetweenUnits(card, cardWithHPAura);

            if (distance <= cardWithHPAura.abilities.hpAura.range) {
              hpAuraNewHp += cardWithHPAura.abilities.hpAura.hpBuff;
            }
          }
        }

        if (card.positiveEffects.hpAuraBuff && hpAuraNewHp > 0) {
          card.changeHPAuraBuff(hpAuraNewHp);
        } else if (!card.positiveEffects.hpAuraBuff && hpAuraNewHp > 0) {
          card.addHPAuraBuff(hpAuraNewHp);
        } else if (card.positiveEffects.hpAuraBuff && hpAuraNewHp === 0) {
          card.removeHPAuraBuff();
        }

        if (!card.alive) {
          player.endOfCardDeath(card);
          board.removeUnitFromBoard(card);
        }
      }
    }
  }
}

export {HPAuraService};
