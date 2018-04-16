enum PlayerEventType {
  PLAYER_CREATED = 'PlayerCreated',
  DECK_SHUFFLED = 'DeckShuffled',
  CARD_DRAWN = 'CardDrawn',
  TURN_ENDED = 'TurnEnded',
  TURN_STARTED = 'TurnStarted'
}

enum GameEventType {
  GAME_CREATED = 'GameCreated',
  TURN_ENDED = 'TurnEnded'
}

enum CardEventType {
  CARD_CREATED = 'CardCreated',
  CARD_UNTAPPED = 'CardUntapped'
}

export {PlayerEventType, GameEventType, CardEventType};
