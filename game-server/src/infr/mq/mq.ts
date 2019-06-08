import config from '../../config';
import * as amqplib from 'amqplib';
import { Channel } from 'amqplib';
import { Event } from '../Event';

let channel: Channel;

let registerMQ = async () => {
  let connect = await amqplib.connect(config.RABBIT_MQ_URL);
  channel = await connect.createChannel();
  channel.assertExchange(config.MAIN_EXCHANGE, 'topic', {durable: true});
};

// registerMQ();

let mq = {
  publish: (event: Event) => {
    channel.publish(config.MAIN_EXCHANGE, event.type, Buffer.from(JSON.stringify(event)));
  }
};

export { mq };
