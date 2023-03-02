Template.cardView.events({
    "click .card-add-btn": function(e) {
        let card = this;

        MeteorApp.addCardToDeck(MeteorApp.data.playerId, card._id);
    },
    "click .card-remove-btn": function(e) {
        let card = this;
        let deck = MeteorApp.getDeck(MeteorApp.data.playerId);

        let index = deck.cards.lastIndexOf(card._id);
        index !== -1 && deck.cards.splice(index, 1);

        MeteorApp.Decks.update(deck._id, deck);

    },
    "click .card-add-hand-btn": function(e) {
        let card = this;

        MeteorApp.addCardToHandDeck(MeteorApp.data.playerId, card._id);
    },
    "click .card-remove-hand-btn": function(e) {
        let card = this;
        let deck = MeteorApp.getDeck(MeteorApp.data.playerId);

        let index = deck.handCards.lastIndexOf(card._id);
        index !== -1 && deck.handCards.splice(index, 1);

        MeteorApp.Decks.update(deck._id, deck);
    }
});
