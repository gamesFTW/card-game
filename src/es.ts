import * as eventstoreConstructor from 'eventstore';

import { promisify } from 'util';

let eventstore = eventstoreConstructor({
  type: 'mongodb',
  host: process.env['MONGO_IP'] || '192.168.99.100',
  port: 27017,
  timeout: 1000
});

let pOn = promisify(eventstore.on.bind(eventstore));
let pGetEventStream = promisify(eventstore.getEventStream.bind(eventstore));

let getEventStream = async (streamId: String): Promise<any> => {
  let stream = await pGetEventStream(streamId);
  stream.commit = promisify(stream.commit.bind(stream));

  return stream;
};

async function start () {

  eventstore.init();
  await pOn('connect');
  console.log('connected');
  let stream = await getEventStream('streamId');
  // console.log('history, history', stream.events);
  stream.addEvent({some: 1});
  stream = await stream.commit();
  console.log(stream.eventsToDispatch);

}
//   console.log('connected');
//   eventstore.getEventStream('streamId', (err, stream) => {
//     if (err) {
//         console.error(err);
//     }
//     let history = stream.events; // the original event will be in events[i].payload
//     console.log('history, history', history);
// });
//   stream.addEvent({ add: 'eventnewx3' });
//   stream.commit((err, stream) => {
//     if (err) {
//       console.error('Error on commit', err);
//       throw err;
//     }
//     console.log('to disp', stream.eventsToDispatch); // this is an array containing all added events in this commit.
//   });
// });
export {
  start
};
