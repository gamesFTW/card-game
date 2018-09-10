import config from '../../../game-server/src/config';
import * as amqplib from 'amqplib';
import { GameEventType } from '../../../game-server/src/domain/events';
import { Channel } from '../../../game-server/node_modules/@types/amqplib';
import { Replies } from '../../../game-server/node_modules/@types/amqplib/properties';

let channel: Channel;
let queue: Replies.AssertQueue;

let registerMQ = async () => {
  let connect = await amqplib.connect(config.RABBIT_MQ_URL);
  channel = await connect.createChannel();
  channel.assertExchange(config.MAIN_EXCHANGE, 'topic', {durable: true});
  queue = await channel.assertQueue('lobby', {exclusive: false});
};

let mq = {
  // TODO: научится подписываться а все ивенты, которые могут быть полезные в лобби,
  // например игра закончилась.
  subscribe: (eventName: string, callback: Function) => {
    channel.bindQueue(queue.queue, config.MAIN_EXCHANGE, eventName);

    channel.consume(queue.queue, function (msg): void {
      let event = JSON.parse(msg.content.toString());

      callback(event);
    }, {noAck: true});
  }
};

export { mq, registerMQ };
