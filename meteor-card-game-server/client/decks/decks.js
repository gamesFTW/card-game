Template.decks.helpers({
    decks: function() {
        return MeteorApp.Decks.find({}, { sort:{ name: 1 }}).fetch();
    },
    cards: function () {
        return this.cards.length;
    }
});


Template.decks.events({
    "submit .deck-name": function(e) {
        e.preventDefault();
        const deckName = e.target.deckName.value;
        MeteorApp.createDeck(deckName);
        Router.go(`/cards/deck/${deckName}/edit`);
    },
    "click .remove-deck": function(e) {
        if (confirm('Точно удалить?!')) {
            MeteorApp.Decks.remove(this._id);
        }
    }
});
