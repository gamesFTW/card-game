import {EntityId} from '../infr/Entity';

enum PlayerEventType {
  PLAYER_CREATED = 'Player:PlayerCreated',
  DECK_SHUFFLED = 'Player:DeckShuffled',
  CARD_DRAWN = 'Player:CardDrawn',
  TURN_ENDED = 'Player:TurnEnded',
  TURN_STARTED = 'Player:TurnStarted',
  CARD_PLAYED_AS_MANNA = 'Player:CardPlayedAsManna',
  CARD_DIED = 'Player:CardDied',
  CARD_PLAYED = 'Player:CardPlayed'
}

interface CardDiedExtra {
  diedCardId: string;
}

interface PlayerDrawnCardData {
  drawnCard?: EntityId;
}

interface PlayerPlayCardAsMannaData {
  playedAsMannaCard?: EntityId;
}

enum GameEventType {
  GAME_CREATED = 'Game:GameCreated',
  TURN_ENDED = 'Game:TurnEnded'
}

enum CardEventType {
  CARD_CREATED = 'Card:CardCreated',
  CARD_TAPPED = 'Card:CardTapped',
  CARD_UNTAPPED = 'Card:CardUntapped',
  CARD_PLAYED = 'Card:CardPlayed',
  CARD_ADDED_CURRENT_MOVING_POINTS = 'Card:CardAddedCurrentMovingPoints',
  CARD_TOOK_DAMAGE = 'Card:CardTookDamage',
  CARD_DIED = 'Card:CardDied',
  CARD_MOVED = 'Card:CardMoved'
}

enum BoardEventType {
  BOARD_CREATED = 'Board:BoardCreated',
  CARD_ADDED_TO_BOARD = 'Board:CardAddedToBoard',
  CARD_MOVED = 'Board:CardMoved'
}

export {PlayerEventType, GameEventType, CardEventType, BoardEventType, CardDiedExtra, PlayerDrawnCardData, PlayerPlayCardAsMannaData};
