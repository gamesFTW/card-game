import * as Router from 'koa-router';
import { LobbyRepository } from './LobbyRepository';
import { DecksResponse, GetGamesResponse } from './dtos';
import { ObjectId } from 'mongodb';
import { LobbyUseCasas } from './LobbyUseCases';
import { MatchMaker } from './MatchMaker';

class LobbyController {
  public router: Router;
  private lobbyRepository: LobbyRepository;
  private lobbyUseCasas: LobbyUseCasas;
  private matchMaker: MatchMaker;

  constructor(lobbyRepository: LobbyRepository, lobbyUseCasas: LobbyUseCasas, matchMaker: MatchMaker) {
    this.lobbyRepository = lobbyRepository;
    this.lobbyUseCasas = lobbyUseCasas;
    this.matchMaker = matchMaker;
    this.router = new Router();
    this.router.get('/methods/getGames', this.getGames.bind(this));
    this.router.get('/publications/Decks', this.getDecks.bind(this));
    this.router.get('/methods/getPlayerDecks', this.getPlayerDecks.bind(this));
    this.router.post('/methods/createGame', this.createGame.bind(this));
    this.router.post('/methods/createSinglePlayerGame', this.createSinglePlayerGame.bind(this));
    this.router.post('/methods/createTutorialGame', this.createTutorialGame.bind(this));
    this.router.post('/methods/findMultyplayerGame', this.findMultyplayerGame.bind(this));
    this.router.post('/methods/removeGameById', this.removeGame.bind(this));
  }

  private async getGames(ctx: Router.IRouterContext): Promise<void> {
    const games = await this.lobbyUseCasas.getGames();

    ctx.body = { Games: games } as GetGamesResponse;
  }

  private async getDecks(ctx: Router.IRouterContext): Promise<void> {
    const decksEntities = await this.lobbyUseCasas.getDecks();

    ctx.body = { Decks: decksEntities } as DecksResponse;
  }

  private async getPlayerDecks(ctx: Router.IRouterContext): Promise<void> {
    const playerDecks = await this.lobbyUseCasas.getPlayerDecks();

    ctx.body = { Decks: playerDecks } as DecksResponse;
  }

  private async createGame(ctx: Router.IRouterContext) {
    ctx.body = await this.lobbyUseCasas.createGame(ctx.request.body.deckId1, ctx.request.body.deckId2, ctx.request.body.random);
  }

  public async createSinglePlayerGame(ctx: Router.IRouterContext): Promise<void> {
    ctx.body = await this.lobbyUseCasas.createSinglePlayerGame(ctx.request.body.deckId1);
  }

  public async createTutorialGame(ctx: Router.IRouterContext): Promise<void> {
    ctx.body = await this.lobbyUseCasas.createTutorialGame();
  }

  public async findMultyplayerGame(ctx: Router.IRouterContext): Promise<void> {
    ctx.body = await this.matchMaker.findMultyplayerGame(ctx.request.body.deckId);
  }

  public async removeGame(ctx: Router.IRouterContext): Promise<void> {
    await this.lobbyRepository.gamesCollection.deleteOne( { _id: new ObjectId(ctx.request.body.gameLobbyId) });
    ctx.body = 'Ok';
  }
}

export { LobbyController };
