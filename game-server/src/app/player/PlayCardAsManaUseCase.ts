import { map } from 'lodash';
import { Player } from '../../domain/player/Player';
import { Repository } from '../../infr/repositories/Repository';
import { formatEventsForClient } from '../../infr/Event';
import { godOfSockets } from '../../infr/GodOfSockets';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId, Entity } from '../../infr/Entity';
import { CardEventType, GameEventType, PlayerDrawnCardData, PlayerEventType } from '../../domain/events';
import { GameData } from '../../domain/game/GameState';

interface PlayCardAsManaParams {
  gameId: EntityId;
  playerId: EntityId;
  cardId: EntityId;
}

interface PlayCardAsManaAction {
  type: string;
  cardId?: EntityId;
}

class PlayCardAsManaUseCase {
  private action: PlayCardAsManaAction = {
    type: 'PlayCardAsManaAction'
  };

  private entities: {
    game?: Game;
    player?: Player,
    card?: Card
  } = {};

  private params: PlayCardAsManaParams;

  public async execute (params: PlayCardAsManaParams): Promise<void> {
    this.params = params;

    await this.readEntities();
    this.addEventListeners();
    this.runBusinessLogic();
    this.addClientActions();
    await this.saveEntities();

    godOfSockets.sendActions(this.entities.game.id, [this.action]);
  }

  private async readEntities (): Promise<void> {
    this.entities.game = await Repository.get<Game>(this.params.gameId, Game);
    this.entities.player = await Repository.get<Player>(this.params.playerId, Player);
    this.entities.card = await Repository.get<Card>(this.params.cardId, Card);
  }

  private async saveEntities (): Promise<void> {
    let entities = map(this.entities, (e: Entity) => e);
    await Repository.save(entities);
  }

  private addEventListeners () {
    this.entities.card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);
  }

  private runBusinessLogic () {
    this.entities.game.endTurn(
      this.entities.endingTurnPlayer, this.entities.endingTurnPlayerOpponent,
      this.entities.endingTurnPlayerMannaPoolCards, this.entities.endingTurnPlayerTableCards
    );
  }

  private addClientActions (): void {
    this.action.cardId = this.entities.card.id;
  }

  @boundMethod
  private onCardTapped (event: Event<CardData>): void {
    this.endTurnAction.cardsUntapped.push(event.data.id);
  }
}

export {PlayCardAsManaUseCase};
