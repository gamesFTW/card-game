import * as lodash from 'lodash';

import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { Player, CardStack } from '../Player/Player';
import { PlayerData, PlayerDrawnCardData, PlayerPlayCardAsMannaData, PlayerState } from '../Player/PlayerState';
import { Card, CardCreationData } from '../card/Card';
import { GameConstants } from '../game/GameConstants';
import { PlayerEventType } from '../events';
import { Point } from '../../infr/Point';
import { Field } from '../field/Field';

class AttackService {
  static attackUnit (attackerCard: Card, attackedCard: Card, attackerPlayer: Player, attackedPlayer: Player, field: Field): void {
    attackerPlayer.checkIfItHisTurn();

    if (!field.checkCreaturesAdjacency(attackerCard, attackedCard)) {
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
