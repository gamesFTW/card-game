import * as Queue from 'bull';
import config from '../../config';
import * as amqplib from 'amqplib';

let mainMQ = new Queue(config.MAIN_MQ, config.REDIS_URL);

let registerMQ = async () => {
  let amqp = await amqplib.connect(config.RABBIT_MQ_URL);
  let channel = await amqp.createChannel();
  await channel.assertQueue('main');
  await channel.consume('main', (message) => {
    console.log('message:', message.content.toString());
  });

  await channel.sendToQueue('main', Buffer.from('MEGA MESSAGE'));
};

registerMQ();

export { mainMQ };
