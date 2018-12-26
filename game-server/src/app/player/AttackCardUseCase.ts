import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { Board } from '../../domain/board/Board';
import { formatEventsForClient } from '../../infr/Event';
import { godOfSockets } from '../../infr/GodOfSockets';
import { Game } from '../../domain/game/Game';
import { CardDiedExtra, CardEventType, PlayerEventType } from '../../domain/events';
import { AttackService } from '../../domain/attackService/AttackService';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';

// TODO: Возможно нужный отдельный ивент для перемещения карты в гв.

interface CardAttackedClientEvent {
  type: string;
  attackerCard: {
    id?: string;
    isTapped?: boolean;
    newHp?: number;
    alive?: boolean
  };
  attackedCard: {
    id?: string;
    isTapped?: boolean;
    newHp?: number;
    alive?: boolean
  };
}

class AttackCardUseCase {
  private cardAttackedClientEvent: CardAttackedClientEvent = {
    type: 'CardAttacked',
    attackerCard: {},
    attackedCard: {}
  };

  public async execute (gameId: string, attackerPlayerId: string, attackerCardId: string, attackedCardId: string): Promise<void> {
    let game = await Repository.get<Game>(gameId, Game);
    let board = await Repository.get<Board>(game.boardId, Board);
    let attackerPlayer = await Repository.get<Player>(attackerPlayerId, Player);
    let attackedPlayerId = game.getPlayerIdWhichIsOpponentFor(attackerPlayerId);
    let attackedPlayer = await Repository.get<Player>(attackedPlayerId, Player);
    let attackerCard = await Repository.get<Card>(attackerCardId, Card);
    let attackedCard = await Repository.get<Card>(attackedCardId, Card);

    attackerCard.addEventListener(CardEventType.CARD_TAPPED, this.onAttackerCardTapped);
    attackerCard.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onAttackerCardTookDamage);
    attackerCard.addEventListener(CardEventType.CARD_DIED, this.onAttackerCardDied);

    attackedCard.addEventListener(CardEventType.CARD_TAPPED, this.onAttackedCardTapped);
    attackedCard.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onAttackedCardTookDamage);
    attackedCard.addEventListener(CardEventType.CARD_DIED, this.onAttackedCardDied);

    AttackService.attackUnit(attackerCard, attackedCard, attackerPlayer, attackedPlayer, board);

    this.cardAttackedClientEvent.attackedCard.id = attackerCardId;
    this.cardAttackedClientEvent.attackedCard.id = attackedCardId;
    let clientEvents = [this.cardAttackedClientEvent];

    godOfSockets.sendClientEventsInGame(game.id, attackedPlayer.id, clientEvents);
  }

  @boundMethod
  private onAttackerCardTapped (event: Event<CardData>): void {
    this.cardAttackedClientEvent.attackerCard.isTapped = true;
  }

  @boundMethod
  private onAttackerCardTookDamage (event: Event<CardData>): void {
    this.cardAttackedClientEvent.attackerCard.newHp = event.data.currentHp;
  }

  @boundMethod
  private onAttackerCardDied (event: Event<CardData>): void {
    this.cardAttackedClientEvent.attackerCard.alive = event.data.alive;
  }

  @boundMethod
  private onAttackedCardTapped (event: Event<CardData>): void {
    this.cardAttackedClientEvent.attackedCard.isTapped = true;
  }

  @boundMethod
  private onAttackedCardTookDamage (event: Event<CardData>): void {
    this.cardAttackedClientEvent.attackedCard.newHp = event.data.currentHp;
  }

  @boundMethod
  private onAttackedCardDied (event: Event<CardData>): void {
    this.cardAttackedClientEvent.attackedCard.alive = event.data.alive;
  }
}

export {AttackCardUseCase};
