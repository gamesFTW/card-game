Template.lobby.helpers({
    games: function() {
        return MeteorApp.Games.find({}, { sort: { date: -1 } });
    }
});

Template.gameView.events({
    "click .start-game-button": function(e) {
        MeteorApp.startLobbyGame(this._id);
    },
    "click .pause-game-button": function(e) {
        MeteorApp.pauseOrUnpauseGame(this._id);
    },
    "click .delete-game-button": function(e) {
        if (confirm('Удалить игру?!')) {
            Meteor.call('removeGameById', this._id);
        }
    }
});

Template.gameView.helpers({
    decks: function() {
        return MeteorApp.Decks.find({}, { sort:{name: 1}}).fetch();
    },
    getPlayerNameById: function(id) {
        if (MeteorApp.Decks.findOne(id)) {
            return MeteorApp.Decks.findOne(id).name;
        } else {
            return 'Unknown';
        }
    }
});
