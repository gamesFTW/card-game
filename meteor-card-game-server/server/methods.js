function isAIDeck(deck) {
    return deck.name.startsWith("AI");
}


function getCardsByIds(cardsIds) {
    const cards = MeteorApp.Cards.find({ _id : { $in : cardsIds }}).fetch();
    const count = lodash.countBy(cardsIds);

    return cards.reduce((allCards, card) => {
            const img = MeteorApp.Images2.findOne(card.imageId)
            if (img) {
                card.image = img.link();
            }

            card.sounds = {};
            if (card.soundPackId) {
                const soundPack = MeteorApp.SoundPacks.findOne(card.soundPackId)

                if (soundPack) {
                    for (let key in soundPack.sounds) {
                        let soundId = soundPack.sounds[key];

                        if (soundId) {
                            const s = MeteorApp.Sounds2.findOne(soundId);

                            if (s) {
                                card.sounds[key] = {url: s.link(), soundName: key};
                            }
                        }
                    }
                }
            }

            // ранее card.abilities был массивом, но теперь мы ждем объект
            if (Array.isArray(card.abilities) || card.abilities === null) {
                card.abilities = {};
            }
            
            lodash.range(count[card._id]).forEach((i) => {
                allCards.push(card);
            });

            return allCards;
        }, []);
}

function createGame(deckId1, deckId2, random = true) {
    let gameServerId;
    let deck1, deck2, isItVicaVersa;

    if (random) {
        isItVicaVersa = Math.random() >= 0.5;
    } else {
        isItVicaVersa = false;
    }

    if (isItVicaVersa) {
        deck1 = MeteorApp.Decks.findOne(deckId2);
        deck2 = MeteorApp.Decks.findOne(deckId1);
    } else {
        deck1 = MeteorApp.Decks.findOne(deckId1);
        deck2 = MeteorApp.Decks.findOne(deckId2);
    }

    try {
        const data = {
            playerA: {
                deck: getCardsByIds(deck1.cards),
                heroes: getCardsByIds(deck1.handCards),
                ai: isAIDeck(deck1)
            },
            playerB: {
                deck: getCardsByIds(deck2.cards),
                heroes: getCardsByIds(deck2.handCards),
                ai: isAIDeck(deck2)
            },
        };

        gameServerId = HTTP.call('POST', CONFIG['gameServerCreateGameURL'], {
            data
        }).data.gameId;

    } catch(e) {
        Meteor.call('removeGameById', gameServerId);
        throw e;
    }

    const gameLobbyId = MeteorApp.createLobbyGame(deck1._id, deck2._id, gameServerId);
    const game = HTTP.call(
        'GET', CONFIG['gameServerGetGameURL'] + '?gameId=' + gameServerId
    ).data.game;

    return {
        gameId: gameServerId,
        lobbyGameId: gameLobbyId,
        playerOfDeckId1: isItVicaVersa ? game.player2Id : game.player1Id,
        playerOfDeckId2: isItVicaVersa ? game.player1Id : game.player2Id
    };
}
      
function createSinglePlayerGame (deckId1) {
    var aiDecks = MeteorApp.Decks.find({"name": /AI.*/}).fetch();

    if (aiDecks.length === 0) {
        throw new Error("There is no deck with name starting with 'AI'");
    }

    var deckId2 = aiDecks[0]._id;
    var lobbyGameId = createGame(deckId1, deckId2).lobbyGameId;

    var lobbyGame = MeteorApp.Games.findOne({"_id": lobbyGameId});

    var gameData = HTTP.call('get', CONFIG['gameServerGetGameURL'], {
        params: {gameId: lobbyGame.gameServerId}
    }).data;

    var playerId;
    var aiId;
    if (lobbyGame.deckId1 === deckId1) {
        playerId = gameData.player1.id;
        aiId = gameData.player2.id;
    } else if (lobbyGame.deckId2 === deckId1) {
        playerId = gameData.player2.id;
        aiId = gameData.player1.id;
    } else {
        throw new Error("Something going wrong");
    }

    return {
        lobbyGameId: lobbyGameId,
        gameServerId: gameData.game.id,
        playerId: playerId,
        aiId: aiId
    }
}

function createTutorialGame () {
    var playerDeck = MeteorApp.Decks.findOne({"name": "PlayerTutorial"});
    var aiDeck = MeteorApp.Decks.findOne({"name": "AITutorial"});

    var lobbyGameId = createGame(playerDeck._id, aiDeck._id, false).lobbyGameId;

    var lobbyGame = MeteorApp.Games.findOne({"_id": lobbyGameId});

    var gameData = HTTP.call('get', CONFIG['gameServerGetGameURL'], {
        params: {gameId: lobbyGame.gameServerId}
    }).data;

    return {
        lobbyGameId: lobbyGameId,
        gameServerId: gameData.game.id,
        playerId: gameData.player1.id,
        aiId: gameData.player2.id
    }
}

Meteor.methods({
    createTutorialGame: createTutorialGame,

    createSinglePlayerGame: createSinglePlayerGame,

    createGame: createGame,
    

    removeGameById: function(gameId) {
        MeteorApp.Games.remove(gameId);
    },

    startGame: function(game) {
        addCardsToPlayer(game._id, game.playerId1, '1', 9, 0);
        addCardsToPlayer(game._id, game.playerId2, '2', 9, 0);

        if (game.type == 'ogre') {
            addCardsToPlayer(game._id, game.playerId3, '3', 9, 0);
            addCardsToPlayer(game._id, game.playerId4, '4', 9, 0);
        }

        // Save initial state for replay
        MeteorApp.Games.update(game._id, {
            $set: {
                initialStateCards: MeteorApp.CardsInGame.find({ gameId: game._id }).fetch()
                }
            }
        );
    },

    // public bool gameFound;
    // public string gameId;
    // public string playerId;
    // public string opponentId;


    findMultyplayerGame: function(myDeckId) {
        let cursor = MeteorApp.QueueOfPlayers.find({gameId: null});
        const players = cursor.fetch();

        if (players.length > 0) {
            // Нашли другого игрока, играем с ним
            const p = players[0];
            const game = Meteor.call("createGame", myDeckId, p.deckId);
            

            MeteorApp.QueueOfPlayers.update(p._id, 
                {$set: {
                    gameId: game.gameId,
                    playerId: game.playerOfDeckId2,
                    opponentId: game.playerOfDeckId1,
                }}
            );

            return {
                gameId: game.gameId,
                playerId: game.playerOfDeckId1,
                opponentId: game.playerOfDeckId2,
                gameFound: true
            };
        }
        
        const currentPlayerInQueueId = MeteorApp.QueueOfPlayers.insert({
            gameId: null, deckId: myDeckId,
        });

        cursor = MeteorApp.QueueOfPlayers.find({ _id: currentPlayerInQueueId });

        // After five seconds, stop keeping the count.
        const waitForPlayer = Meteor.wrapAsync(function (time, res) {
            const timer = Meteor.setTimeout(() => {
                handle.stop();
                // не дождолись, милый не пришел
                res(null, {gameFound: false});
            }, time);

            const handle = cursor.observeChanges({
                changed(id, {gameId, playerId, opponentId}) {
                    // другой игрок нас нашел
                    Meteor.clearTimeout(timer);
                    res(null, {
                        gameId,
                        playerId,
                        opponentId,
                        gameFound: true
                    });
                }
            });
            
        });


        var resultOfWaiting = waitForPlayer(10000);
        MeteorApp.QueueOfPlayers.remove(currentPlayerInQueueId);
        return resultOfWaiting;
    }
    
});
