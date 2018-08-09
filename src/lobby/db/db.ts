import { MongoClient, Collection } from 'mongodb';
import { resolve } from 'url';

const host = process.env['MONGO_IP'] || '192.168.99.100';
const url = `mongodb://${host}:27017`;
const dbName = 'eventstore';

const getCollection = (collectionName: string): Promise<Collection> => {
  const promise = new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err: any, client: any): void {
      if (err) {
        console.error(err);
        reject(err);
      }
      const db = client.db(dbName);
      resolve(db.collection(collectionName));
    });
  });

  return promise;
};

export { getCollection };
