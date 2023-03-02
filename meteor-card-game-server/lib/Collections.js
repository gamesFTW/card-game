import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

MeteorApp = {};

MeteorApp.data = {
    playerId: null
};

MeteorApp.CardsInGame = new Mongo.Collection("CardsInGame");
MeteorApp.Cards = new Mongo.Collection("Cards");
MeteorApp.Decks = new Mongo.Collection("Decks");
MeteorApp.Games = new Mongo.Collection("Games");
MeteorApp.SoundPacks = new Mongo.Collection("SoundPacks");
MeteorApp.QueueOfPlayers = new Mongo.Collection("QueueOfPlayers");

var imageStore = new FS.Store.GridFS("Images", {});
MeteorApp.Images = new FS.Collection("Images", {
    stores: [imageStore]
});

var soundStore = new FS.Store.GridFS("Sounds", {});
MeteorApp.Sounds = new FS.Collection("Sounds", {
    stores: [soundStore]
});

MeteorApp.Images2 = new FilesCollection({
    collectionName: 'Images2',
    allowClientCode: true,
    onBeforeUpload(file) {
      // Allow upload files under 10MB, and only in png/jpg/jpeg formats
      if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
        return true;
      }
      return 'Please upload image, with size equal or less than 10MB';
    }
});

MeteorApp.Sounds2 = new FilesCollection({
    collectionName: 'Sounds2',
    allowClientCode: true,
    onBeforeUpload(file) {
      // Allow upload files under 10MB, and only in wav/mp3 formats
      if (file.size <= 10485760 && /wav|mp3/i.test(file.extension)) {
        return true;
      }
      return 'Please upload image, with size equal or less than 10MB';
    }
});
