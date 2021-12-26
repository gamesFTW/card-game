import { Player } from '../../domain/player/Player';
import { Game } from '../../domain/game/Game';
import { Card } from '../../domain/card/Card';
import { CardData } from '../../domain/card/CardState';
import { Event } from '../../infr/Event';
import { boundMethod } from 'autobind-decorator';
import { EntityId } from '../../infr/Entity';
import { CardEventType, GameEventType, PlayerDrawnCardData, PlayerEventType } from '../../domain/events';
import { GameData } from '../../domain/game/GameState';
import { UseCase } from '../../infr/UseCase';
import { Board } from '../../domain/board/Board';
import { CardChanges } from '../player/AttackCardUseCase';
import { PlayerData } from '../../domain/player/PlayerState';

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
  cardChanges: CardChanges[];
  cardsDrawn?: Array<EntityId>;
  gameEnded?: boolean;
  lostPlayerId?: string;
  wonPlayerId?: string;
}

class EndTurnUseCase extends UseCase<EndTurnParams> {
  protected action: EndTurnAction = {
    type: 'EndTurnAction',
    cardChanges: [],
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
    this.entities.endingTurnPlayer.addEventListener(PlayerEventType.PLAYER_LOST, this.onPlayerLost);
    this.entities.endingTurnPlayerOpponent.addEventListener(PlayerEventType.PLAYER_LOST, this.onPlayerLost);

    this.entities.game.addEventListener(GameEventType.GAME_ENDED, this.onGameEnded);

    this.entities.endingTurnPlayerManaPoolCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
    });

    this.entities.endingTurnPlayerTableCards.forEach((card: Card) => {
      card.addEventListener(CardEventType.CARD_DIED, this.onCardDied);
      card.addEventListener(CardEventType.CARD_UNTAPPED, this.onCardUntapped);
      card.addEventListener(CardEventType.CARD_ADDED_CURRENT_MOVING_POINTS, this.onCardAddedCurrentMovingPoints);
      card.addEventListener(CardEventType.CARD_RESET_BLOCK_ABILITY, this.onCardResetBlockAbility);
      card.addEventListener(CardEventType.CARD_RESET_EVASION_ABILITY, this.onCardResetEvasionAbility);
      card.addEventListener(CardEventType.CARD_BLOCKED_RANGE_ABILITY, this.onCardBlockRangeAbility);
      card.addEventListener(CardEventType.CARD_UNBLOCKED_RANGE_ABILITY, this.onCardUnblockRangeAbility);
      card.addEventListener(CardEventType.CARD_TOOK_DAMAGE, this.onCardHpChanged);
      card.addEventListener(CardEventType.CARD_POISON_REMOVED, this.onCardPoisonRemoved);
      card.addEventListener(CardEventType.CARD_DAMAGE_CURSE_REMOVED, this.onCardDamageCurseRemoved);
      card.addEventListener(CardEventType.CARD_HP_AURA_BUFF_ADDED, this.onCardHPAuraBuffAdded);
      card.addEventListener(CardEventType.CARD_HP_AURA_BUFF_CHANGED, this.onCardHPAuraBuffAdded);
      card.addEventListener(CardEventType.CARD_HP_AURA_BUFF_REMOVED, this.onCardHPAuraBuffRemoved);
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
  private onPlayerLost (event: Event<PlayerData>): void {
    this.entities.game.endGame(event.data.id);
  }

  @boundMethod
  private onGameEnded (event: Event<GameData>): void {
    this.action.gameEnded = true;

    this.action.lostPlayerId = event.data.lostPlayerId;
    this.action.wonPlayerId = event.data.wonPlayerId;
  }

  @boundMethod
  private onCardDied (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.killed = !event.data.alive;
  }

  @boundMethod
  private onCardDrawn (event: Event<CardData, PlayerDrawnCardData>): void {
    this.action.cardsDrawn.push(event.extra.drawnCard);
  }

  @boundMethod
  private onCardAddedCurrentMovingPoints (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.currentMovingPoints = event.data.currentMovingPoints;
  }

  @boundMethod
  private onCardResetBlockAbility (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.usedInThisTurnBlockAbility = event.data.abilities.block.usedInThisTurn;
  }

  @boundMethod
  private onCardResetEvasionAbility (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.usedInThisTurnEvasionAbility = event.data.abilities.evasion.usedInThisTurn;
  }

  @boundMethod
  private onCardBlockRangeAbility (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.blockedRangeAbilityInBeginningOfTurn = event.data.abilities.range.blockedInBeginningOfTurn;
  }

  @boundMethod
  private onCardUnblockRangeAbility (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.blockedRangeAbilityInBeginningOfTurn = event.data.abilities.range.blockedInBeginningOfTurn;
  }

  @boundMethod
  private onCardHpChanged (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.newHp = event.data.currentHp;
  }

  @boundMethod
  private onCardPoisonRemoved (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isPoisoned = false;
  }

  @boundMethod
  private onCardDamageCurseRemoved (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isDamageCursed = false;
    cardChanges.damage = event.data.damage;
  }

  @boundMethod
  private onCardHPAuraBuffAdded (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.newHp = event.data.currentHp;
    cardChanges.hpAuraBuffChange = event.data.positiveEffects.hpAuraBuff.hpBuff;
  }

  @boundMethod
  private onCardHPAuraBuffRemoved (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.newHp = event.data.currentHp;
    cardChanges.hpAuraBuffChange = 0;
  }

  @boundMethod
  private onCardUntapped (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.isUntapped = !event.data.tapped;
  }

  @boundMethod
  private onCardHealed (event: Event<CardData>): void {
    let cardChanges = this.getOrCreateCardChangesById(event.data.id);

    cardChanges.newHp = event.data.currentHp;
  }
}

export {EndTurnUseCase};
