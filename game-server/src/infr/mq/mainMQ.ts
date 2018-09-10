import config from '../../config';
import * as amqplib from 'amqplib';

let registerMQ = async () => {
  let connect = await amqplib.connect(config.RABBIT_MQ_URL);
  let channel = await connect.createChannel();
  channel.assertExchange(config.MAIN_EXCHANGE, 'fanout', {durable: true});

  let i = 0;

  setInterval(() => {
    channel.publish(config.MAIN_EXCHANGE, '', new Buffer('HI ' + i));
    console.log('PUBLISHED');
    i++;
  }, 2000);
};

export { registerMQ };
