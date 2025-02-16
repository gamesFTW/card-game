import * as Router from 'koa-router';
import { GameDto, CardDto, CardSoundDto } from './dtos';
import * as lodash from 'lodash';
import { Deck } from './entities/Deck';
import axios from 'axios';
import { Card } from './entities/Card';
import { LobbyRepository } from './LobbyRepository';

class LobbyUseCasas {
  public router: Router;
  private lobbyRepository: LobbyRepository;

  constructor(lobbyRepository: LobbyRepository) {
    this.lobbyRepository = lobbyRepository;
  }

  public async getGames(): Promise<GameDto[]> {
    const gamesEntities = await this.lobbyRepository.gamesCollection.find({}).toArray();
    const games: GameDto[] = [];

    for (const gameEntity of gamesEntities) {
      const deck1 = await this.lobbyRepository.decksCollection.findOne({ _id: gameEntity.deckId1 });
      const deck2 = await this.lobbyRepository.decksCollection.findOne({ _id: gameEntity.deckId2 });

      games.push({
        ...gameEntity,
        deckName1: deck1 ? deck1.name : 'undef',
        deckName2: deck1 ? deck2.name : 'undef',
      });
    }

    return games;
  }

  public async getDecks(): Promise<Deck[]> {
    return await this.lobbyRepository.decksCollection.find({}).toArray();
  }

  public async getPlayerDecks(): Promise<Deck[]> {
    const decksEntities = await this.lobbyRepository.decksCollection.find({}).toArray();
    return decksEntities.filter((d) => !d.name.startsWith("AI") && !d.name.startsWith("PlayerTutorial"));
  }

  public async createGame(deckId1: string, deckId2: string, random = true) {
    let deck1, deck2, isItVicaVersa;

    if (random) {
        isItVicaVersa = Math.random() >= 0.5;
    } else {
        isItVicaVersa = false;
    }

    if (isItVicaVersa) {
        deck1 = await this.lobbyRepository.decksCollection.findOne( { _id: deckId2 });
        deck2 = await this.lobbyRepository.decksCollection.findOne( { _id: deckId1 });
    } else {
        deck1 = await this.lobbyRepository.decksCollection.findOne( { _id: deckId1 });
        deck2 = await this.lobbyRepository.decksCollection.findOne( { _id: deckId2 });
    }

    const data = {
        playerA: {
            deck: await this.getCardsByIds(deck1.cards),
            heroes: await this.getCardsByIds(deck1.handCards),
            ai: this.isAIDeck(deck1)
        },
        playerB: {
            deck: await this.getCardsByIds(deck2.cards),
            heroes: await this.getCardsByIds(deck2.handCards),
            ai: this.isAIDeck(deck2)
        },
    };

    const createGameResponse = await axios.post('http://localhost:3000/createGame', data);
    let gameServerGameId = createGameResponse.data.gameId;

    const gameLobbyId = await this.createLobbyGame(deck1._id, deck2._id, gameServerGameId);
    console.log('gameLobbyId', gameLobbyId);

    const getGameResponse = await axios.get(`http://localhost:3000/getGame?gameId=${gameServerGameId}`);
    const gameData = getGameResponse.data;

    return {
        gameId: gameServerGameId,
        lobbyGameId: gameLobbyId,
        playerOfDeckId1: isItVicaVersa ? gameData.game.player2Id : gameData.game.player1Id,
        playerOfDeckId2: isItVicaVersa ? gameData.game.player1Id : gameData.game.player2Id
    };
  }

  public async createSinglePlayerGame(deckId1: string) {
    var aiDecks = await this.lobbyRepository.decksCollection.find({"name": /AI.*/}).toArray();

    if (aiDecks.length === 0) {
        throw new Error("There is no deck with name starting with 'AI'");
    }

    var deckId2 = aiDecks[0]._id;
    var game = await this.createGame(deckId1, deckId2);

    var lobbyGame = await this.lobbyRepository.gamesCollection.findOne({"_id": game.lobbyGameId});

    const getGameResponse = await axios.get(`http://localhost:3000/getGame?gameId=${lobbyGame.gameServerId}`);
    const gameData = getGameResponse.data;

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
        lobbyGameId: game.lobbyGameId,
        gameServerId: gameData.game.id,
        playerId: playerId,
        aiId: aiId
    }
  }

  public async getCardsByIds(cardsIds: string[]): Promise<CardDto[]> {
    const cards = await this.lobbyRepository.cardsCollection.find({ _id : { $in : cardsIds }}).toArray();
    const count = lodash.countBy(cardsIds);

    const cardsDtosPromises = [];

    for (const card of cards) {
      const promise = this.buildCards(card, count[card._id]);
      cardsDtosPromises.push(promise);
    }

    const cardsDtos = await Promise.all(cardsDtosPromises);

    return lodash.flatten(cardsDtos);
  }

  private async buildCards(card: Card, cardNumber: number): Promise<CardDto[]> {
    const cardDto = {...card, image: '', sounds: {} as CardSoundDto};
    cardDto.image = this.buildImageUrl(cardDto.imageId);

    if (cardDto.soundPackId) {
        const soundPack = await this.lobbyRepository.soundPacksCollection.findOne({ _id: cardDto.soundPackId })

        if (soundPack) {
          for (let soundName in soundPack.sounds) {
            const soundId = soundPack.sounds[soundName];
            cardDto.sounds[soundName] = {url: this.buildSoundUrl(soundId), soundName: soundName};
          }
        }
    }

    // ранее card.abilities был массивом, но теперь мы ждем объект
    if (Array.isArray(cardDto.abilities) || cardDto.abilities === null) {
        cardDto.abilities = {};
    }

    const allCards: CardDto[] = [];
    for (let i = 0; i <= cardNumber; i++) {
      allCards.push(cardDto as CardDto);
    }

    return allCards;
  }

  private async createLobbyGame(deckId1: string, deckId2: string, gameServerId: string): Promise<string> {
    const result = await this.lobbyRepository.gamesCollection.insertOne({
        type: 'solo',
        date: new Date(),
        gameServerId,
        started: false,
        deckId1,
        deckId2,
        deckId3: null,
        deckId4: null,
    });

    return result.insertedId.toHexString();
  };
  
  private isAIDeck(deck: Deck) {
      return deck.name.startsWith("AI");
  }

  private buildImageUrl(imageId: string): string {
    return `image?imageId=${imageId}`;
  }

  private buildSoundUrl(soundId: string): string {
    return `sound?soundId=${soundId}`;
  }
}

export { LobbyUseCasas };
