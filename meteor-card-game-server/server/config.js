
SimpleRest.configure({
  collections: ['Games', 'Decks', 'Images', 'Cards']
});

CONFIG = {
  gameServerURL: 'http://localhost:3000/',
};

CONFIG['gameServerCreateGameURL'] = CONFIG['gameServerURL'] + 'createGame';
CONFIG['gameServerGetGameURL'] = CONFIG['gameServerURL'] + 'getGame';
