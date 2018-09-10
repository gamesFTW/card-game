import config from '../../../game-server/src/config';
import { GameModel, GameStatus } from '../db/db';
import * as amqplib from 'amqplib';

let registerMQ = async () => {
  let connect = await amqplib.connect(config.RABBIT_MQ_URL);
  let channel = await connect.createChannel();

  channel.assertExchange(config.MAIN_EXCHANGE, 'fanout', {durable: true});

  let queue = await channel.assertQueue('lobby', {exclusive: false});

  channel.bindQueue(queue.queue, config.MAIN_EXCHANGE, '');

  channel.consume(queue.queue, function (msg): void {
    console.log(' [x] %s', msg.content.toString());
  }, {noAck: true});
};

export { registerMQ };

// const game = new GameModel({ gameId: message.data.id, status: GameStatus.NEW });
// await game.save();