import { Player, CardStack } from '../player/Player';
import { Card } from '../card/Card';
import { Board } from '../board/Board';
import { RangeService } from '../abilities/RangeService';
import { Point } from '../../infr/Point';
import Bresenham from './Bresenham';
import { AbilitiesParams } from '../../app/player/AttackCardUseCase';
import { EntityId } from '../../infr/Entity';
import { Area } from '../area/Area';
import { DomainError } from '../../infr/DomainError';
import { BaseAttackService } from './BaseAttackService';

class RangeAttackService {
  public static rangeAttackUnit (
    attackerCard: Card, attackedCard: Card,
    attackerPlayer: Player, attackedPlayer: Player,
    board: Board, attackedPlayerTableCards: Card[], areas: Area[], abilitiesParams: AbilitiesParams): void {
    attackerPlayer.checkIfItHisTurn();

    if (!attackerPlayer.checkCardIn(attackerCard, CardStack.TABLE)) {
      throw new DomainError(`Card ${attackerCard.id} is not in table stack`);
    }

    if (!attackedPlayer.checkCardIn(attackedCard, CardStack.TABLE)) {
      throw new DomainError(`Card ${attackedCard.id} is not in table stack`);
    }

    if (!attackerCard.abilities.range) {
      throw new DomainError(`Card ${attackedCard.id} dont have range ability`);
    }

    if (attackerCard.abilities.range.blockedInBeginningOfTurn) {
      throw new DomainError(`Card ${attackedCard.id} can't range attack because blocked in beginning of turn`);
    }

    let isBlocked = RangeService.checkIsBlocked(attackerCard, attackedPlayerTableCards, board);
    if (isBlocked) {
      throw new DomainError(`Card ${attackedCard.id} can't range attack because blocked by enemy unit`);
    }

    this.checkCanRangeAttackTo(attackerCard, attackedCard, attackedPlayer, board, attackedPlayerTableCards, areas);

    attackerCard.tap();

    let attackerDmg = BaseAttackService.calcDamage(attackerCard, attackedCard);

    attackedCard.takeDamage(attackerDmg);

    if (attackerCard.abilities.ricochet && abilitiesParams.ricochetTargetCardId) {
      this.ricochet(attackerCard, attackedCard, attackedPlayerTableCards, attackedPlayer, board, abilitiesParams.ricochetTargetCardId);
    }

    if (attackerCard.abilities.push && abilitiesParams.pushAt) {
      BaseAttackService.pushAttackedCard(attackerCard, attackedCard, board, abilitiesParams.pushAt, areas);
    }

    if (!attackedCard.alive) {
      attackedPlayer.endOfCardDeath(attackedCard);
      board.removeUnitFromBoard(attackedCard);
    }
  }

  private static checkCanRangeAttackTo (
    attackerCard: Card, attackedCard: Card, attackedPlayer: Player, board: Board, attackedPlayerTableCards: Card[], areas: Area[]): boolean {
    const attackerCardPosition = board.getPositionOfUnit(attackerCard);
    const attackedCardPosition = board.getPositionOfUnit(attackedCard);

    let path: Point[] = Bresenham.plot(attackerCardPosition, attackedCardPosition);
    const range = Math.abs(attackerCardPosition.x - attackedCardPosition.x) + Math.abs(attackerCardPosition.y - attackedCardPosition.y);
    const attackerRange = attackerCard.abilities.range.range;

    if (range > attackerRange) {
      throw new DomainError(`Unit ${attackerCard.id} can't reach unit ${attackedCard.id} in range attack.`);
    }

    let attackedPlayerTableCardsIds = attackedPlayerTableCards.map((card) => card.id);
    let areasIds = areas.map((area) => area.id);

    let betweenPath = path;
    betweenPath.shift();
    betweenPath.pop();

    let blockersOfRangeAttack = [];
    for (let point of betweenPath) {
      const cardId = board.getUnitIdByPosition(point);

      if (attackedPlayerTableCardsIds.includes(cardId)) {
        blockersOfRangeAttack.push(cardId);
      }

      const areaId = board.getAreaIdByPosition(point);

      if (areasIds.includes(areaId)) {
        let area;

        for (let a of areas) {
          if (a.id === areaId) {
            area = a;
          }
        }

        if (!area.canUnitsShootThoughtIt) {
          blockersOfRangeAttack.push(areaId);
        }
      }
    }

    if (blockersOfRangeAttack.length > 0) {
      throw new DomainError(`Unit ${attackerCard.id} can\'t attack unit ${attackedCard.id}. There is cards on path: ${blockersOfRangeAttack}`);
    } else {
      return true;
    }
  }

  private static ricochet (
      attackerCard: Card, attackedCard: Card, attackedPlayerTableCards: Card[],
      attackedPlayer: Player, board: Board, ricochetedAt: EntityId
    ): void {
    let ricochetTargetCard;

    for (let card of attackedPlayerTableCards) {
      if (card.id === ricochetedAt) {
        ricochetTargetCard = card;
      }
    }

    let isAttackedAndRicochetTargetAdjacent = board.checkUnitsAdjacency(ricochetTargetCard, attackedCard);

    if (!isAttackedAndRicochetTargetAdjacent) {
      throw new DomainError(`Card ${attackedCard.id} and ${ricochetedAt} is not adjacent.`);
    }

    let attackerDmg = BaseAttackService.calcDamage(attackerCard, ricochetTargetCard);

    ricochetTargetCard.takeDamage(attackerDmg);

    if (!ricochetTargetCard.alive) {
      attackedPlayer.endOfCardDeath(ricochetTargetCard);
      board.removeUnitFromBoard(ricochetTargetCard);
    }
  }
}

export {RangeAttackService};
