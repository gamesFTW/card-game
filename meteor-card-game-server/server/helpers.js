/**
 * @param {String} - deckId1
 * @param {String} - deckId2
 * @returns {string} - game ID
 */
MeteorApp.createLobbyGame = function(deckId1, deckId2, gameServerId) {
  return MeteorApp.Games.insert({
      type: 'solo',
      date: new Date(),
      gameServerId,

      started: false,
     
      // Players ids
      deckId1,
      deckId2,
      deckId3: null,
      deckId4: null,
  });
};
