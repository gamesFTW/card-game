enum PlayerEventType {
  PLAYER_CREATED = 'PlayerCreated',
  DECK_SHUFFLED = 'DeckShuffled',
  CARD_DRAWN = 'CardDrawn',
  TURN_ENDED = 'TurnEnded',
  TURN_STARTED = 'TurnStarted',
  CARD_PLAYED_AS_MANNA = 'CardPlayedAsManna',
  CARD_PLAYED = 'CardPlayed'
}

enum GameEventType {
  GAME_CREATED = 'GameCreated',
  TURN_ENDED = 'TurnEnded'
}

enum CardEventType {
  CARD_CREATED = 'CardCreated',
  CARD_TAPPED = 'CardTapped',
  CARD_UNTAPPED = 'CardUntapped'
}

enum FieldEventType {
  FIELD_CREATED = 'FieldCreated',
  CARD_ADDED_TO_FIELD = 'CardAddedToField'
}

export {PlayerEventType, GameEventType, CardEventType, FieldEventType};
