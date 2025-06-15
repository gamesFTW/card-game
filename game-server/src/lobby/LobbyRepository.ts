import { MongoClient, Db, Collection, GridFSBucket, ObjectId } from 'mongodb';
import { Game } from './entities/Game';
import { Deck } from './entities/Deck';
import { Card } from './entities/Card';
import { SoundPack } from './entities/SoundPack';
import { QueueOfPlayer } from './entities/QueueOfPlayer';
import config from '../config';

class LobbyRepository {
    public gamesCollection: Collection<Game>;
    public decksCollection: Collection<Deck>;
    public cardsCollection: Collection<Card>;
    public soundPacksCollection: Collection<SoundPack>;
    public queueOfPlayersCollection: Collection<QueueOfPlayer>;

    public imagesFilerecordCollection: Collection<any>;
    public imagesChunksCollection: Collection<any>;
    public soundsFilerecordCollection: Collection<any>;
    public soundsChunksCollection: Collection<any>;
    // public imagesBucket: GridFSBucket;
    private database: Db;
    private mongoClient: MongoClient;

    constructor(client: MongoClient) {
        this.mongoClient = client;
    }

    async init() {
        this.database = this.mongoClient.db('lobby');
        this.gamesCollection = this.database.collection('Games');
        this.decksCollection = this.database.collection('Decks');
        this.cardsCollection = this.database.collection('Cards');
        this.soundPacksCollection = this.database.collection('SoundPacks');
        this.queueOfPlayersCollection = this.database.collection('QueueOfPlayers');

        this.imagesFilerecordCollection = this.database.collection('cfs.Images.filerecord');
        this.imagesChunksCollection = this.database.collection('cfs_gridfs.Images.chunks');
        this.soundsFilerecordCollection = this.database.collection('cfs.Sounds.filerecord');
        this.soundsChunksCollection = this.database.collection('cfs_gridfs.Sounds.chunks');
        // this.imagesBucket = new GridFSBucket(this.database, { bucketName: 'Images' });
    }
}

export { LobbyRepository }
