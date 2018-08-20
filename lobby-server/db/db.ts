import * as mongoose from 'mongoose';
import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';

const connectToDb = () => {
  const host = process.env['MONGO_IP'] || '192.168.99.100';
  const dbName = 'lobby';
  const url = `mongodb://${host}:27017/${dbName}`;
  mongoose.connect(url);
};

enum GameStatus {
  NEW = 'NEW',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED'
}

// Scheme
class GameSchema extends Typegoose {
  @prop()
  gameId: String;

  @prop()
  status: GameStatus;
}
const GameModel = new GameSchema().getModelForClass(GameSchema);

export {
  GameModel,
  GameStatus,
  connectToDb
};
