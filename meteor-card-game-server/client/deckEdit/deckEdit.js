MeteorApp.getDeck = function(playerId) {
    playerId = playerId || MeteorApp.data.playerId;
    let deck = MeteorApp.Decks.findOne({ name: playerId });
    if (!deck) {
        let deckId = MeteorApp.createDeck(playerId);
        return MeteorApp.Decks.findOne(deckId);
    }
    return deck;
};

/**
 * 
 * @param {String} name
 * @returns {} 
 */
MeteorApp.createDeck = function(name) {
    return MeteorApp.Decks.insert({
        name: name,
        cards: [],
        handCards: [],
        desc: ""
    });
};

MeteorApp.addCardToDeck = function(name, cardId) {
    let deck = MeteorApp.Decks.findOne({name: name});
    
    deck.cards.push(cardId);
    
    MeteorApp.Decks.update(deck._id, deck);
    
};

MeteorApp.addCardToHandDeck = function(name, cardId) {
    let deck = MeteorApp.Decks.findOne({name: name});
    
    if (!deck.handCards) {
        deck.handCards = [];
    }    
    
    deck.handCards.push(cardId);
    
    MeteorApp.Decks.update(deck._id, deck);
};


MeteorApp.clearDeck = (name) => {
    let deck = MeteorApp.Decks.findOne({ name: name });
    deck.cards = [];
    deck.handCards = [];
    MeteorApp.Decks.update(deck._id, deck);
};

let addTypesToFilter = function(filter) {
    let filterType = Session.get('filterType');
    if (filterType === 'heroes') {
        filter = lodash.assign(filter, { hero: true , type: 'creature'});
    } else if (filterType === 'creatures') {
        filter = lodash.assign(filter, { hero: false , type: 'creature'});
    } else if (filterType === 'spells') {
        filter = lodash.assign(filter, { type: 'spell'});
    } else if (filterType === 'areas') {
        filter = lodash.assign(filter, { type: 'area'});
    }
};


let getAllTags = function(filter) {
    let cardsWithTags = MeteorApp.Cards.find(filter).fetch().reduce((list, c) => {
        if(c.tags) {
            return list.concat(c.tags)
        }
        return list;
    }, []);

    return _.uniq(cardsWithTags)
};

let getCards = function() {
    let name = Session.get('searchCardName') || '';
    let nameRe = new RegExp(name, 'i');

    let text = Session.get('searchCardText') || '';
    let textRe = new RegExp(text, 'i');

    let filter = { name: nameRe, text: textRe, draft: false, summoned: false };

    addTypesToFilter(filter);


    let tagList = [];

    let searchTag = Session.get('searchTag') || null;
    if (searchTag) {
        tagList.push({tags: searchTag});
    }

    let raceTag = Session.get('raceTag') || null;
    if (raceTag) {
        tagList.push({tags: raceTag});
    }

    if (searchTag || raceTag) {
        filter = lodash.assign(filter, { $and: tagList} );
    }


    const cards = MeteorApp.Cards.find(
        filter,
        { sort: {  manaCost: 1 } }
    ).fetch();
    console.log(cards);

    return cards;
};


Template.deckEdit.helpers({
    deckLength: function() {
        let deck = MeteorApp.getDeck();
        return deck.cards.length + deck.handCards.length;
    },
    
    cards: getCards,
    
    tagsList: function () {
        let filter = {};

        addTypesToFilter(filter);

        let raceTag = Session.get('raceTag') || null;
        if (raceTag) {
            filter.tags = raceTag;
        }

        let tags = getAllTags(filter);

        let tagWithoutRace = tags.reduce(
            (list, tag) => {
                if(!lodash.includes(tag, '_race_')) {
                    return list.concat(tag)
                }

                return list;
            },
            []
        );

        return _.sortBy(tagWithoutRace, String);
    },

    raceList: function () {
        let filter = {};

        addTypesToFilter(filter);
        let tags = getAllTags(filter);

        let tagWithRace = tags.reduce(
            (list, tag) => {
                if(lodash.includes(tag, '_race_')) {
                    return list.concat(tag)
                }

                return list;
            },
            []
        );

        return _.sortBy(tagWithRace, String);
    },
    
    playerId: function() {
        return MeteorApp.data.playerId
    },
    
    name: function() {
        let deck = MeteorApp.getDeck();
        return deck.name;
    },

    desc: function() {
        let deck = MeteorApp.getDeck();
        return deck.desc;
    },
    
    cardsInDeck: function() {
        let deck = MeteorApp.getDeck();
        let cardsIds = deck.cards;
        return lodash(cardsIds)
            .uniq()
            .map(function(cardId) {
                let card = MeteorApp.Cards.findOne(cardId);
                if (!card) { 
                    console.warn('There is no card', cardId, 'It will be deleted from deck.');
                    
                    let index = deck.cards.lastIndexOf(cardId);
                    index !== -1 && deck.cards.splice(index, 1);

                    MeteorApp.Decks.update(deck._id, deck);           
                } else {
                    card.quantity = cardsIds.filter(
                        function(number) {return number === cardId}
                    ).length;    
                } 
                return card;
            })
            .sortBy('manaCost')
            .value();
    },
    cardsInHandDeck: function() {
        let deck = MeteorApp.getDeck();
        let cardsIds = deck.handCards;
        return lodash.uniq(cardsIds)
            .map(function(cardId) {
                let card = MeteorApp.Cards.findOne(cardId);
                if (!card) { 
                    console.warn('There is no card', cardId, 'It will be deleted from deck.');
                    
                    let index = deck.handCards.lastIndexOf(cardId);
                    index !== -1 && deck.handCards.splice(index, 1);

                    MeteorApp.Decks.update(deck._id, deck);           
                } else {
                    card.quantity = cardsIds.filter(
                        function(number) {return number === cardId}
                    ).length;    
                } 
                
                return card;
            });
    },
    manaDistribution: function () {
        const MAX_MANA = 8 + 1;
        const cards = MeteorApp.getDeck().cards;
        
        
        let distribution = _.range(MAX_MANA).reduce((obj, x) => {
            obj[x]=0;
            return obj;
        }, {});
        
        
        cards.forEach(cardId => {
            let card = MeteorApp.Cards.findOne(cardId);
            if (card.manaCost !== undefined) {
                distribution[card.manaCost]++; 
            }
        });
        
        return {
            manaTitle: _.keys(distribution),
            manaCount: _.values(distribution)
        }
    }
});

Template.deckEdit.events({
    'keyup .card-search': function(e) {
        Session.set('searchCardName', e.target.value);
    },
    'click .filter-type': function(e) {
        Session.set('filterType', e.target.value);
        resetTagFilter();
        resetRaceFilter();
    },
    'change .deckEdit__tag-selector': function (e) {
        Session.set('searchTag', e.target.value);
    },
    'change .deckEdit__race-selector': function (e) {
        Session.set('raceTag', e.target.value);
        resetTagFilter();
    },
    'blur .deckEdit__desc-area': function (e) {
        let desc = e.target.value;
        let deck = MeteorApp.getDeck();
        deck.desc = desc;
        MeteorApp.Decks.update(deck._id, deck);
    },
    'blur .deckEdit__name-area': function (e) {

        let name = e.target.value;
        Router.go(`/cards/deck/${name}/edit`);

        let deck = MeteorApp.getDeck();
        deck.name = name;
        MeteorApp.Decks.update(deck._id, deck);

    },
    'keyup .card-text-search': function(e) {
        Session.set('searchCardText', e.target.value);
    }
});

// resetTagFilter и resetRaceFilter исправляют следующий баг:
// При если выбрать фильтр по тегу или рассе, а потом поменять другие фильтры
// так, чтобы кант не оказалось, в изначальном фильтре значение поменяется на
// '', но при этом не вызовится событие change.
// setTimeout нужен, потому, что действия после Session.set не успевают отработать.
function resetTagFilter() {
    setTimeout(() => {
        let tagInputValue = $('.deckEdit__tag-selector').val();
        Session.set('searchTag', tagInputValue);
    }, 0);
}

function resetRaceFilter() {
    setTimeout(() => {
        let tagInputValue = $('.deckEdit__race-selector').val();
        Session.set('raceTag', tagInputValue);
    }, 0);
}
