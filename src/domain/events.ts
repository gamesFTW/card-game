enum PlayerEventType {
  PLAYER_CREATED = 'PlayerCreated',
  DECK_SHUFFLED = 'DeckShuffled',
  CARD_DRAWN = 'CardDrawn'
}

enum GameEventType {
  GAME_CREATED = 'GameCreated'
}

enum CardEventType {
  CARD_CREATED = 'CardCreated'
}

export {PlayerEventType, GameEventType, CardEventType};
