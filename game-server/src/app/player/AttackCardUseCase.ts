import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { Board } from '../../domain/board/Board';
import { godOfSockets } from '../../infr/GodOfSockets';
import { Game } from '../../domain/game/Game';
import {CardDiedExtra, CardEventType, PlayerEventType} from '../../domain/events';
import { AttackService } from '../../domain/attackService/AttackService';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import {PlayerData} from '../../domain/player/PlayerState';
import {Point} from '../../infr/Point';
import { UseCase } from '../../infr/UseCase';

// TODO: Возможно нужный отдельный ивент для перемещения карты в гв.

interface AttackCardParams {
  gameId: EntityId;
  attackerPlayerId: EntityId;
  attackerCardId: EntityId;
  attackedCardId: EntityId;
}

interface CardAttackedAction {
  type: string;
  attackerCard: {
    id?: string;
    isTapped?: boolean;
    newHp?: number;
    killed?: boolean;
  };
  attackedCard: {
    id?: string;
    isTapped?: boolean;
    newHp?: number;
    killed?: boolean;
  };
}

class AttackCardUseCase extends UseCase {
  protected action: CardAttackedAction = {
    type: 'CardAttackedAction',
    attackerCard: {},
    attackedCard: {}
  };

  protected entities: {
    game?: Game;
    attackerPlayer?: Player,
    attackedPlayer?: Player,
    attackerCard?: Card,
    attackedCard?: Card,
    board?: Board
  } = {};

  protected params: AttackCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await Repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.attackerPlayer = await Repository.get<Player>(this.params.attackerPlayerId, Player);
    let attackedPlayerId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.attackerPlayerId);
    this.entities.attackedPlayer = await Repository.get<Player>(attackedPlayerId, Player);
    this.entities.attackerCard = await Repository.get<Card>(this.params.attackerCardId, Card);
    this.entities.attackedCard = await Repository.get<Card>(this.params.attackedCardId, Card);
  }

  protected addEventListeners (): void {
    this.entities.attackerCard.addEventListener(CardEventType.CARD_TAPPED, this.onAttackerCardTapped);
    this.entities.attackerCard.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onAttackerCardTookDamage);
    this.entities.attackerCard.addEventListener(CardEventType.CARD_DIED, this.onAttackerCardDied);

    this.entities.attackedCard.addEventListener(CardEventType.CARD_TAPPED, this.onAttackedCardTapped);
    this.entities.attackedCard.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onAttackedCardTookDamage);
    this.entities.attackedCard.addEventListener(CardEventType.CARD_DIED, this.onAttackedCardDied);
  }
  
  protected runBusinessLogic (): void {
    AttackService.attackUnit(
      this.entities.attackerCard, this.entities.attackedCard, this.entities.attackerPlayer,
      this.entities.attackedPlayer, this.entities.board
    );
  }
  
  protected addClientActions (): void {
    this.action.attackerCard.id = this.params.attackerCardId;
    this.action.attackedCard.id = this.params.attackedCardId;
  }

  @boundMethod
  private onAttackerCardTapped (event: Event<CardData>): void {
    this.action.attackerCard.isTapped = true;
  }

  @boundMethod
  private onAttackerCardTookDamage (event: Event<CardData>): void {
    this.action.attackerCard.newHp = event.data.currentHp;
  }

  @boundMethod
  private onAttackerCardDied (event: Event<CardData>): void {
    this.action.attackerCard.killed = !event.data.alive;
  }

  @boundMethod
  private onAttackedCardTapped (event: Event<CardData>): void {
    this.action.attackedCard.isTapped = true;
  }

  @boundMethod
  private onAttackedCardTookDamage (event: Event<CardData>): void {
    this.action.attackedCard.newHp = event.data.currentHp;
  }

  @boundMethod
  private onAttackedCardDied (event: Event<CardData>): void {
    this.action.attackedCard.killed = !event.data.alive;
  }
}

export {AttackCardUseCase};
