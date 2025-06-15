import { Router } from 'express';
import { LobbyRepository } from './LobbyRepository';
import { DecksResponse, GetGamesResponse } from './dtos';
import { LobbyUseCasas } from './LobbyUseCases';
import { MatchMaker } from './MatchMaker';
import { ObjectId } from 'mongodb';

class LobbyController {
  public router: Router;
  private lobbyRepository: LobbyRepository;
  private lobbyUseCasas: LobbyUseCasas;
  private matchMaker: MatchMaker;

  constructor(lobbyRepository: LobbyRepository, lobbyUseCasas: LobbyUseCasas, matchMaker: MatchMaker) {
    this.lobbyRepository = lobbyRepository;
    this.lobbyUseCasas = lobbyUseCasas;
    this.matchMaker = matchMaker;
    this.router = Router();
    this.router.get('/methods/getGames', this.getGames.bind(this));
    this.router.get('/publications/Decks', this.getDecks.bind(this));
    this.router.get('/methods/getPlayerDecks', this.getPlayerDecks.bind(this));
    this.router.post('/methods/createGame', this.createGame.bind(this));
    this.router.post('/methods/createSinglePlayerGame', this.createSinglePlayerGame.bind(this));
    this.router.post('/methods/createTutorialGame', this.createTutorialGame.bind(this));
    this.router.post('/methods/findMultyplayerGame', this.findMultyplayerGame.bind(this));
    this.router.post('/methods/removeGameById', this.removeGame.bind(this));
  }

  private async getGames(_request, response): Promise<void> {
    const games = await this.lobbyUseCasas.getGames();

    response.send({ Games: games } as GetGamesResponse);
  }

  private async getDecks(_request, response): Promise<void> {
    const decksEntities = await this.lobbyUseCasas.getDecks();

    response.send({ Decks: decksEntities } as DecksResponse);
  }

  private async getPlayerDecks(request, response): Promise<void> {
    const playerDecks = await this.lobbyUseCasas.getPlayerDecks();

    response.send({ Decks: playerDecks } as DecksResponse);
  }

  private async createGame(request, response) {
    response.send(await this.lobbyUseCasas.createGame(request.body.deckId1, request.body.deckId2, request.body.random));
  }

  public async createSinglePlayerGame(request, response): Promise<void> {
    response.send(await this.lobbyUseCasas.createSinglePlayerGame(request.body.deckId1));
  }

  public async createTutorialGame(request, response): Promise<void> {
    response.send(await this.lobbyUseCasas.createTutorialGame());
  }

  public async findMultyplayerGame(request, response): Promise<void> {
    response.send(await this.matchMaker.findMultyplayerGame(request.body.deckId));
  }

  public async removeGame(request, response): Promise<void> {
    await this.lobbyRepository.gamesCollection.deleteOne( { _id: new ObjectId(request.body.gameLobbyId as string) });
    response.send(`Ok`);
  }
}

export { LobbyController };
