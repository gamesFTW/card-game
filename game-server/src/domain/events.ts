enum PlayerEventType {
  PLAYER_CREATED = 'PlayerCreated',
  DECK_SHUFFLED = 'DeckShuffled',
  CARD_DRAWN = 'CardDrawn',
  TURN_ENDED = 'TurnEnded',
  TURN_STARTED = 'TurnStarted',
  CARD_PLAYED_AS_MANNA = 'CardPlayedAsManna',
  CARD_DIED = 'CardDied',
  CARD_PLAYED = 'CardPlayed'
}

enum GameEventType {
  GAME_CREATED = 'GameCreated',
  TURN_ENDED = 'TurnEnded'
}

enum CardEventType {
  CARD_CREATED = 'CardCreated',
  CARD_TAPPED = 'CardTapped',
  CARD_UNTAPPED = 'CardUntapped',
  CARD_PLAYED = 'CardPlayed',
  CARD_ADDED_CURRENT_MOVING_POINTS = 'CardAddedCurrentMovingPoints',
  CARD_TOOK_DAMAGE = 'CardTookDamage',
  CARD_DIED = 'CardDied',
  CARD_MOVED = 'CardMoved'
}

enum FieldEventType {
  FIELD_CREATED = 'FieldCreated',
  CARD_ADDED_TO_FIELD = 'CardAddedToField',
  CARD_MOVED = 'CardMoved'
}

export {PlayerEventType, GameEventType, CardEventType, FieldEventType};
