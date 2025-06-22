import chalk from 'chalk';
import cors from 'cors';

import { godOfSockets } from './battle/infr/GodOfSockets';
import config from './config';
import { gameController } from './battle/http/gameController/gameController';
import { playerController } from './battle/http/playerController';
import { debugController } from './battle/http/_debug/debugController';
import { StaticContorller } from './battle/http/staticController';
import { DomainError } from './battle/infr/DomainError';
import { LobbyUseCasas } from './lobby/LobbyUseCases';
import { LobbyRepository } from './lobby/LobbyRepository';
import { LobbyController } from './lobby/LobbyController';
import { MatchMaker } from './lobby/MatchMaker';
import { Collection, MongoClient } from 'mongodb';

import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { Repository } from './battle/infr/repositories/Repository';
import { DevRepository } from './battle/infr/repositories/DevRepository';
import { Game } from './lobby/entities/Game';
import { WebSocketServer } from 'ws';
import { AiService } from './ai/AiService';

let DEBUG = true;

async function main(): Promise<void> {
  const app = express();

  const corsOptions = {
    // origin: process.env.NODE_ENV === 'production' 
    //   ? 'https://your-production-domain.com' 
    //   : 'http://localhost:3000',
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
  
  app.use(cors(corsOptions));
  app.use(express.static(path.join(process.cwd(), 'static')));
  app.use(express.json());

  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const start = performance.now();
    next();
    const ms = performance.now() - start;
    DEBUG && console.log(chalk.green(`[${req.method}] ${req.url} - ${ms}ms`));
  });
  
  const mongoClient = new MongoClient(`mongodb://${config.MONGO_URL}:${config.MONGO_PORT}/`);
  mongoClient.connect();
  const database = mongoClient.db('lobby');
  const gamesCollection: Collection<Game> = database.collection('Games');
  Repository.gamesCollection = gamesCollection;
  DevRepository.gamesCollection = gamesCollection;
  const lobbyRepository = new LobbyRepository(mongoClient);
  await lobbyRepository.init();

  const lobbyUseCasas = new LobbyUseCasas(lobbyRepository);
  const staticContorller = new StaticContorller(lobbyRepository);
  const matchMaker = new MatchMaker(lobbyUseCasas);
  const lobbyController = new LobbyController(lobbyRepository, lobbyUseCasas, matchMaker);

  const aiService = new AiService(lobbyUseCasas);
  aiService.init();

  app.use(gameController);
  app.use(playerController);
  app.use(debugController);
  app.use(staticContorller.router);
  app.use(lobbyController.router);

  app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
    DEBUG && console.error(chalk.red(error.stack));

    if (error instanceof DomainError) {
      res.status(500);
    } else {
      res.status(520);
    }
    res.json(`${error.message}`);
  });
  
  const server = app.listen(3000, () => {
      console.log(`Server running at http://localhost:3000`);
  });

  const webSocketServer = new WebSocketServer({ server });
  godOfSockets.autoRegistrateUsers(webSocketServer);
}

main();
