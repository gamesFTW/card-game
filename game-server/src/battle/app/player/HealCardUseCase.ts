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

interface HealCardParams {
  gameId: EntityId;
  playerId: EntityId;
  healerCardId: EntityId;
  healedCardId: EntityId;
}

interface CardChanges {
  id?: string;
  isTapped?: boolean;
  newHp?: number;
  currentMovingPoints?: number;
}

interface CardHealedAction {
  type: string;
  healerCard: CardChanges;
  healedCard: CardChanges;
}

class HealCardUseCase extends UseCase<HealCardParams> {
  protected action: CardHealedAction = {
    type: 'CardHealedAction',
    healerCard: {},
    healedCard: {}
  };

  protected entities: {
    game?: Game;
    player?: Player,
    opponent?: Player,
    healerCard?: Card,
    healedCard?: Card,
    board?: Board,
  } = {};

  protected params: HealCardParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);
    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
    this.entities.player = await this.repository.get<Player>(this.params.playerId, Player);
    let opponent = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.playerId);
    this.entities.opponent = await this.repository.get<Player>(opponent, Player);
    this.entities.healerCard = await this.repository.get<Card>(this.params.healerCardId, Card);
    this.entities.healedCard = await this.repository.get<Card>(this.params.healedCardId, Card);
  }

  protected addEventListeners (): void {
    this.entities.healerCard.addEventListener(CardEventType.CARD_TAPPED, this.onHealerCardTapped);
    this.entities.healedCard.addEventListener(CardEventType.CARD_HEALED, this.onHealedCardHpChanged);
  }

  protected runBusinessLogic (): void {
    this.entities.player.healCard(
      this.entities.healerCard,
      this.entities.healedCard,
      this.entities.board,
      this.entities.opponent
    );
  }

  protected addClientActions (): void {
    this.action.healerCard.id = this.params.healerCardId;
    this.action.healedCard.id = this.params.healedCardId;
  }

  @boundMethod
  private onHealerCardTapped (event: Event<CardData>): void {
    this.action.healerCard.isTapped = true;
    this.action.healerCard.currentMovingPoints = event.data.currentMovingPoints;
  }

  @boundMethod
  private onHealedCardHpChanged (event: Event<CardData>): void {
    this.action.healedCard.newHp = event.data.currentHp;
  }
}

export {HealCardUseCase};
