Meteor.method("Decks-with-cards", function () {
  const decks = MeteorApp.Decks.find().fetch().map(function(deck) {

    deck.cards = deck.cards.map(function(cardId) {
      return MeteorApp.Cards.findOne(cardId);
    });

    deck.handCards = deck.handCards.map(function(cardId) {
      return MeteorApp.Cards.findOne(cardId);
    });

    return deck;
  });
  return decks;
}, {
  url: "methods/decks-with-cards",
  httpMethod: "get",
});

Meteor.method("getGames", function () {
  const Games = MeteorApp.Games.find({}).fetch().map(function(game) {
    const deck1 = MeteorApp.Decks.findOne(game.deckId1);
    const deck2 = MeteorApp.Decks.findOne(game.deckId2);
    if (deck1) {
      game.deckName1 = deck1.name;
    } else {
      game.deckName1 = 'undef';
    }

    if (deck2) {
      game.deckName2 = deck2.name;
    } else {
      game.deckName2 = 'undef';
    }

    return game;
  });
  return {Games};
}, {
  url: "methods/getGames",
  httpMethod: "get",
});

Meteor.method("getPlayerDecks", function () {
  const decks = MeteorApp.Decks.find({}).fetch()
    .filter((d) => !d.name.startsWith("AI") && !d.name.startsWith("PlayerTutorial"));

  return {Decks: decks};
}, {
  url: "methods/getPlayerDecks",
  httpMethod: "get",
});

SimpleRest.setMethodOptions('createGame', {
  getArgsFromRequest: function (request) {
    var content = request.body;

    if (!content.deckId1) {
      throw new Error('deckId1 not set');
    }

    if (!content.deckId2) {
      throw new Error('deckId2 not set');
    }
    return [content.deckId1, content.deckId2];
  }
});

SimpleRest.setMethodOptions('createSinglePlayerGame', {
  getArgsFromRequest: function (request) {
    var content = request.body;

    if (!content.deckId1) {
      throw new Error('deckId1 not set');
    }

    return [content.deckId1];
  }
});

SimpleRest.setMethodOptions('removeGameById', {
  getArgsFromRequest: function (request) {
    var content = request.body;

    if (!content.gameLobbyId) {
      throw new Error('gameLobbyId not set');
    }

    return [content.gameLobbyId];
  }
});

SimpleRest.setMethodOptions('findMultyplayerGame', {
  getArgsFromRequest: function (request) {
    return [request.body.deckId];
  }
});
