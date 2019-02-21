import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { CardEventType } from '../../domain/events';
import {UseCase} from '../../infr/UseCase';

interface PlayCardAsManaParams {
  gameId: EntityId;
  playerId: EntityId;
  cardId: EntityId;
}

interface PlayCardAsManaAction {
  type: string;
  cardId?: EntityId;
  tapped?: boolean;
}

class PlayCardAsManaUseCase extends UseCase {
  protected action: PlayCardAsManaAction = {
    type: 'PlayCardAsManaAction'
  };

  protected entities: {
    game?: Game;
    player?: Player,
    card?: Card
  } = {};

  protected params: PlayCardAsManaParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.player = await Repository.get<Player>(this.params.playerId, Player);
    this.entities.card = await Repository.get<Card>(this.params.cardId, Card);
  }

  protected addEventListeners () {
    this.entities.card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);
  }

  protected runBusinessLogic () {
    this.entities.player.playCardAsMana(this.entities.card);
  }

  protected addClientActions (): void {
    this.action.cardId = this.entities.card.id;
  }

  @boundMethod
  private onCardTapped (event: Event<CardData>): void {
    this.action.cardId = event.data.id;
    this.action.tapped = event.data.tapped;
  }
}

export {PlayCardAsManaUseCase};
