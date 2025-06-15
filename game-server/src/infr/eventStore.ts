// import * as eventstoreConstructor from 'eventstore';

const eventstore = require('eventstore');

import { promisify } from 'util';
import config from '../config';

let es = eventstore({
  type: 'mongodb',
  host: config.MONGO_URL,
  port: config.MONGO_PORT,
  timeout: 1000
});

let promisedGetEvents = promisify(es.getEvents.bind(es));

let promisedOn = promisify(es.on.bind(es));

let promisedGetEventStream = promisify(es.getEventStream.bind(es));
let finallyPromisedGetEventStream = async (id: {aggregateId: string, aggregate: string}): Promise<any> => {
  let stream = await promisedGetEventStream(id);
  stream.commit = promisify(stream.commit.bind(stream));

  return stream;
};

let promisedEventstore = {
  init: es.init.bind(es),
  on: promisedOn,
  getEventStream: finallyPromisedGetEventStream,
  getEvents: promisedGetEvents
};

promisedEventstore.init((err: Error) => {
  if (err !== null) {
    console.log(err);
  } else {
    console.log('Event store was connected to database');
  }
});

// let stream = await eventstore.getEventStream('streamId');
// // console.log('history, history', stream.events);
// stream.addEvent({some: 1});
// stream = await stream.commit();
// console.log(stream.eventsToDispatch);
//
// stream.addEvent({some: 2});
// stream = await stream.commit();
// console.log(stream.eventsToDispatch);

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
  promisedEventstore as eventStore
};
