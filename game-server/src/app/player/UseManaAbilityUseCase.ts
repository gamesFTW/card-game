import { Player } from '../../domain/player/Player';
import { Board } from '../../domain/board/Board';
import { Game } from '../../domain/game/Game';
import { CardEventType } from '../../domain/events';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { UseCase } from '../../infr/UseCase';

interface CardUsedManaAbilityParams {
  gameId: EntityId;
  playerId: EntityId;
  cardId: EntityId;
}

interface CardUsedManaAbilityAction {
  type: string;
  playerId?: string;
  tappedCardId?: string;
  cardsUntapped?: EntityId[];
}

class UseManaAbilityUseCase extends UseCase<CardUsedManaAbilityParams> {
  protected action: CardUsedManaAbilityAction = {
    type: 'CardUsedManaAbilityAction',
    cardsUntapped: []
  };

  protected entities: {
    game?: Game;
    player?: Player,
    opponent?: Player,
    card?: Card,
    board?: Board,
    playerManaPoolCards?: Card[],
  } = {};

  protected params: CardUsedManaAbilityParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.player = await this.repository.get<Player>(this.params.playerId, Player);
    this.entities.card = await this.repository.get<Card>(this.params.cardId, Card);
    this.entities.playerManaPoolCards = await this.repository.getMany <Card>(this.entities.player.manaPool, Card);
  }

  protected addEventListeners (): void {
    this.entities.card.addEventListener(CardEventType.CARD_TAPPED, this.onCardTapped);

    this.entities.playerManaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });
  }

  protected runBusinessLogic (): void {
    this.entities.player.useManaAbility(
      this.entities.card,
      this.entities.playerManaPoolCards
    );
  }

  protected addClientActions (): void {
    this.action.playerId = this.params.playerId;
  }

  @boundMethod
  private onCardTapped (event: Event<CardData>): void {
    this.action.tappedCardId = event.data.id;
  }

  @boundMethod
  private onCardUntapped (event: Event<CardData>): void {
    this.action.cardsUntapped.push(event.data.id);
  }
}

export {UseManaAbilityUseCase};
