enum PlayerEventType {
  PLAYER_CREATED = 'PLAYER_CREATED',
  DECK_SHUFFLED = 'DECK_SHUFFLED',
  CARD_DRAWN = 'CARD_DRAWN'
}

enum GameEventType {
  GAME_CREATED = 'GAME_CREATED'
}

enum CardEventType {
  CARD_CREATED = 'CARD_CREATED'
}

export {PlayerEventType, GameEventType, CardEventType};
