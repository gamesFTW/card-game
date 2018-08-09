import { getCollection } from './db/db';
import { EntityId } from '../infr/Entity';

const addGameToLobby = async (gameId: EntityId) => {
  const collection = await getCollection('games');
  collection.insert({gameId: gameId});
};

const getAllGames = async () => {
  const collection = await getCollection('games');

  // return collection.find().map((g: any) => g.gameId);
};

export {
  addGameToLobby,
  getAllGames
};
