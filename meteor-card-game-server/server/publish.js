Meteor.publish('Cards', function() { return MeteorApp.Cards.find() });
Meteor.publish('CardsNames', function() { return MeteorApp.Cards.find({}, {fields: {name: 1, _id: 1}}); });
Meteor.publish('Decks', function() { return MeteorApp.Decks.find() });
Meteor.publish('Games', function() { return MeteorApp.Games.find() });
Meteor.publish('Images', function() { return MeteorApp.Images.find() });
Meteor.publish('Sounds', function() { return MeteorApp.Sounds.find() });
Meteor.publish('SoundPacks', function() { return MeteorApp.SoundPacks.find() });
Meteor.publish('QueueOfPlayers', function() { return MeteorApp.QueueOfPlayers.find() });

Meteor.publish('files.images.all', function () { return MeteorApp.Images2.find().cursor; });
Meteor.publish('files.sounds.all', function () { return MeteorApp.Sounds2.find().cursor; });

MeteorApp.Images.allow({
  'insert': function () {
    return true;
  }
});

MeteorApp.Sounds.allow({
  'insert': function () {
    return true;
  }
});

