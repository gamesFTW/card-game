import {EntityId} from '../infr/Entity';
import {Point} from '../infr/Point';

enum PlayerEventType {
  PLAYER_CREATED = 'Player:PlayerCreated',
  DECK_SHUFFLED = 'Player:DeckShuffled',
  CARD_DRAWN = 'Player:CardDrawn',
  TURN_ENDED = 'Player:TurnEnded',
  TURN_STARTED = 'Player:TurnStarted',
  CARD_PLAYED_AS_MANA = 'Player:CardPlayedAsMana',
  CARD_DIED = 'Player:CardDied',
  CARD_PLAYED = 'Player:CardPlayed',
  PLAYER_LOST = 'Player:PlayerLost'
}

interface CardDiedExtra {
  diedCardId: string;
}

interface CardMovedExtra {
  path?: Point[];
}

interface BoardCardMovedExtra {
  toPosition?: Point;
  movedCardId?: EntityId;
}

interface PlayerDrawnCardData {
  drawnCard?: EntityId;
}

interface PlayerPlayCardAsManaData {
  playedAsManaCard?: EntityId;
}

enum GameEventType {
  GAME_CREATED = 'Game:GameCreated',
  TURN_ENDED = 'Game:TurnEnded',
  GAME_ENDED = 'Game:GameEnded'
}

enum CardEventType {
  CARD_CREATED = 'Card:CardCreated',
  CARD_TAPPED = 'Card:CardTapped',
  CARD_UNTAPPED = 'Card:CardUntapped',
  CARD_PLAYED = 'Card:CardPlayed',
  CARD_ADDED_CURRENT_MOVING_POINTS = 'Card:CardAddedCurrentMovingPoints',
  CARD_TOOK_DAMAGE = 'Card:CardTookDamage',
  CARD_DIED = 'Card:CardDied',
  CARD_MOVED = 'Card:CardMoved',
  CARD_HEALED = 'Card:CardHealed',
  CARD_BLOCKED_RANGE_ABILITY = 'Card:CardBlockedRangeAbility',
  CARD_UNBLOCKED_RANGE_ABILITY = 'Card:CardUnblockedRangeAbility',
  CARD_USE_BLOCK_ABILITY = 'Card:CardUseBlockAbility',
  CARD_USE_EVASION_ABILITY = 'Card:CardUseEvasionAbility',
  CARD_RESET_BLOCK_ABILITY = 'Card:CardResetBlockAbility',
  CARD_RESET_EVASION_ABILITY = 'Card:CardResetEvasionAbility',
  CARD_POISONED = 'Card:CardPoisoned',
  CARD_POISON_REMOVED = 'Card:CardRemovePoison',
  CARD_DAMAGE_CURSED = 'Card:CardCursed',
  CARD_DAMAGE_CURSE_REMOVED = 'Card:CardDamageCurseRemoved',
  CARD_HP_AURA_BUFF_ADDED = 'Card:CardAddHpAuraBuff',
  CARD_HP_AURA_BUFF_CHANGED = 'Card:CardChangeHpAuraBuff',
  CARD_HP_AURA_BUFF_REMOVED = 'Card:CardRemoveHpAuraBuff',
  CARD_AIMED = 'Card:CardAimed',
  CARD_ATTACK_WITH_AIM = 'Card:CardAttackWithAim'
}

enum BoardEventType {
  BOARD_CREATED = 'Board:BoardCreated',
  BOARD_OBJECT_ADDED_TO_BOARD = 'Board:BoardObjectAddedToBoard',
  CARD_MOVED = 'Board:CardMoved',
  CARD_REMOVED = 'Board:CardRemoved'
}

enum AreaEventType {
  AREA_CREATED = 'Area:AREA_CREATED'
}

export {
  PlayerEventType,
  GameEventType,
  CardEventType,
  BoardEventType,
  CardDiedExtra,
  CardMovedExtra,
  PlayerDrawnCardData,
  PlayerPlayCardAsManaData,
  BoardCardMovedExtra,
  AreaEventType
};
