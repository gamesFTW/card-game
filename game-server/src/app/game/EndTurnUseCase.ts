import { Player } from '../../domain/player/Player';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { CardEventType, PlayerDrawnCardData, PlayerEventType } from '../../domain/events';
import { GameData } from '../../domain/game/GameState';
import { UseCase } from '../../infr/UseCase';
import { Board } from '../../domain/board/Board';

// TODO: Возможно нужный отдельный ивент для перемещения карты в гв.
interface EndTurnParams {
  gameId: string;
  endingTurnPlayerId: string;
}

interface EndTurnAction {
  type: string;
  currentTurn?: number;
  endedPlayerId?: string;
  startedPlayerId?: string;
  cardsMovingPointsUpdated?: Array<{id: string; currentMovingPoints: number}>;
  cardsBlockAbilityUpdated?: Array<{id: string; usedInThisTurn: boolean}>;
  cardsEvasionAbilityUpdated?: Array<{id: string; usedInThisTurn: boolean}>;
  cardsRangeAbilityUpdated?: Array<{id: string; blockedInBeginningOfTurn: boolean}>;
  cardsHealed?: Array<{id: string; newHp: number}>;
  cardsUntapped?: Array<EntityId>;
  cardsDrawn?: Array<EntityId>;
}

class EndTurnUseCase extends UseCase {
  protected action: EndTurnAction = {
    type: 'EndTurnAction',
    cardsMovingPointsUpdated: [],
    cardsBlockAbilityUpdated: [],
    cardsEvasionAbilityUpdated: [],
    cardsRangeAbilityUpdated: [],
    cardsHealed: [],
    cardsUntapped: [],
    cardsDrawn: []
  };

  protected entities: {
    game?: Game;
    endingTurnPlayer?: Player;
    endingTurnPlayerOpponent?: Player;
    endingTurnPlayerManaPoolCards?: Card[];
    endingTurnPlayerTableCards?: Card[];
    endingTurnPlayerOpponentTableCards?: Card[];
    board?: Board;
  } = {};

  protected params: EndTurnParams;

  protected async readEntities (): Promise<void> {
    this.entities.game = await this.repository.get<Game>(this.params.gameId, Game);

    let endingTurnPlayerOpponentId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.endingTurnPlayerId);

    this.entities.endingTurnPlayer = await this.repository.get<Player>(this.params.endingTurnPlayerId, Player);
    this.entities.endingTurnPlayerOpponent = await this.repository.get<Player>(endingTurnPlayerOpponentId, Player);

    this.entities.endingTurnPlayerManaPoolCards = await this.repository.getMany <Card>(this.entities.endingTurnPlayer.manaPool, Card);
    this.entities.endingTurnPlayerTableCards = await this.repository.getMany <Card>(this.entities.endingTurnPlayer.table, Card);

    this.entities.endingTurnPlayerOpponentTableCards = await this.repository.getMany<Card>(this.entities.endingTurnPlayerOpponent.table, Card);

    this.entities.board = await this.repository.get<Board>(this.entities.game.boardId, Board);
  }

  protected addEventListeners (): void {
    this.entities.endingTurnPlayerManaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    this.entities.endingTurnPlayerTableCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
      card.addEventListener(CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS, this.onCardAddedCurrentMovingPoints);
      card.addEventListener(CardEventType.CARD_RESET_BLOCK_ABILITY, this.onCardResetBlockAbility);
      card.addEventListener(CardEventType.CARD_RESET_EVASION_ABILITY, this.onCardResetEvasionAbility);
      card.addEventListener(CardEventType.CARD_BLOCKED_RANGE_ABILITY, this.onCardBlockRangeAbility);
      card.addEventListener(CardEventType.CARD_UNBLOCKED_RANGE_ABILITY, this.onCardUnblockRangeAbility);
    });

    this.entities.endingTurnPlayerOpponentTableCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_HEALED, this.onCardHealed);
      card.addEventListener(CardEventType.CARD_BLOCKED_RANGE_ABILITY, this.onCardBlockRangeAbility);
      card.addEventListener(CardEventType.CARD_UNBLOCKED_RANGE_ABILITY, this.onCardUnblockRangeAbility);
    });

    this.entities.endingTurnPlayer.addEventListener(PlayerEventType.CARD_DRAWN, this.onCardDrawn);
  }

  protected runBusinessLogic (): void {
    this.entities.game.endTurn(
      this.entities.endingTurnPlayer, this.entities.endingTurnPlayerOpponent,
      this.entities.endingTurnPlayerManaPoolCards, this.entities.endingTurnPlayerTableCards,
      this.entities.endingTurnPlayerOpponentTableCards, this.entities.board
    );
  }

  protected addClientActions (): void {
    this.action.currentTurn = this.entities.game.currentTurn;
    this.action.endedPlayerId = this.params.endingTurnPlayerId;
    this.action.startedPlayerId = this.entities.game.getPlayerIdWhichIsOpponentFor(this.params.endingTurnPlayerId);
  }

  @boundMethod
  private onGameEnded (event: Event<GameData>): void {
    this.action.currentTurn = event.data.currentTurn;
  }

  @boundMethod
  private onCardAddedCurrentMovingPoints (event: Event<CardData>): void {
    this.action.cardsMovingPointsUpdated.push({id: event.data.id, currentMovingPoints: event.data.currentMovingPoints});
  }

  @boundMethod
  private onCardResetBlockAbility (event: Event<CardData>): void {
    this.action.cardsBlockAbilityUpdated.push({id: event.data.id, usedInThisTurn: event.data.abilities.block.usedInThisTurn});
  }

  @boundMethod
  private onCardResetEvasionAbility (event: Event<CardData>): void {
    this.action.cardsEvasionAbilityUpdated.push({id: event.data.id, usedInThisTurn: event.data.abilities.evasion.usedInThisTurn});
  }

  @boundMethod
  private onCardBlockRangeAbility (event: Event<CardData>): void {
    this.action.cardsRangeAbilityUpdated.push({id: event.data.id, blockedInBeginningOfTurn: event.data.abilities.range.blockedInBeginningOfTurn});
  }

  @boundMethod
  private onCardUnblockRangeAbility (event: Event<CardData>): void {
    this.action.cardsRangeAbilityUpdated.push({id: event.data.id, blockedInBeginningOfTurn: event.data.abilities.range.blockedInBeginningOfTurn});
  }

  @boundMethod
  private onCardUntapped (event: Event<CardData>): void {
    this.action.cardsUntapped.push(event.data.id);
  }

  @boundMethod
  private onCardDrawn (event: Event<CardData, PlayerDrawnCardData>): void {
    this.action.cardsDrawn.push(event.extra.drawnCard);
  }

  @boundMethod
  private onCardHealed (event: Event<CardData>): void {
    this.action.cardsHealed.push({id: event.data.id, newHp: event.data.currentHp});
  }
}

export {EndTurnUseCase};
