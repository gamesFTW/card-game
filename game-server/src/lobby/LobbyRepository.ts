import { MongoClient, Db, Collection, GridFSBucket, ObjectId } from 'mongodb';
import { Game } from './entities/Game';
import { Deck } from './entities/Deck';
import { Card } from './entities/Card';
import { SoundPack } from './entities/SoundPack';

class LobbyRepository {
    public gamesCollection: Collection<Game>;
    public decksCollection: Collection<Deck>;
    public cardsCollection: Collection<Card>;
    public soundPacksCollection: Collection<SoundPack>;

    public imagesFilerecordCollection: Collection<any>;
    public imagesChunksCollection: Collection<any>;
    public soundsFilerecordCollection: Collection<any>;
    public soundsChunksCollection: Collection<any>;
    // public imagesBucket: GridFSBucket;
    private database: Db;
    private client: MongoClient;

    async init() {
        this.client = new MongoClient('mongodb://localhost:27017/');
        await this.client.connect();
      
        this.database = this.client.db('lobby_old');
        this.gamesCollection = this.database.collection('Games');
        this.decksCollection = this.database.collection('Decks');
        this.cardsCollection = this.database.collection('Cards');
        this.soundPacksCollection = this.database.collection('SoundPacks');

        this.imagesFilerecordCollection = this.database.collection('cfs.Images.filerecord');
        this.imagesChunksCollection = this.database.collection('cfs_gridfs.Images.chunks');
        this.soundsFilerecordCollection = this.database.collection('cfs.Sounds.filerecord');
        this.soundsChunksCollection = this.database.collection('cfs_gridfs.Sounds.chunks');
        // this.imagesBucket = new GridFSBucket(this.database, { bucketName: 'Images' });
    }
}

export { LobbyRepository }
