import { getType, getReturnOfExpression } from 'typesafe-actions';
import lodash from 'lodash';

import * as cardsActions from './actions';
const returnsOfActions = Object.values(cardsActions).map(getReturnOfExpression);
export type Action = typeof returnsOfActions[number];

type CardId = string;

// Не правильно хранить тут такие типы.
export type Card = {
  id: CardId;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
  mannaCost?: number;
  movingPoints?: number;
  currentMovingPoints?: number;
  position: {
    screenX?: number;
    screenY?: number;
  }
};

export type PlayerCards = {
  deck: CardId[];
  hand: CardId[];
  mannaPool: CardId[];
  table: CardId[];
  graveyard: CardId[];
};

export type CardsState = {
  player: PlayerCards;
  opponent: PlayerCards;
  allCards: {[id: string]: Card};
};

const initState: CardsState = {
  player: {
    deck: [],
    hand: [],
    mannaPool: [],
    table: [],
    graveyard: []
  },
  opponent: {
    deck: [],
    hand: [],
    mannaPool: [],
    table: [],
    graveyard: []
  },
  allCards: {}
};

function returnIds (cards: Card[]): CardId[] {
  return cards.map((card: Card) => card.id);
}

export const cardsReducer = (state: CardsState = initState, action: Action) => {
  switch (action.type) {
    case getType(cardsActions.initCards): {
      let player = action.payload.player;
      let opponent = action.payload.opponent;

      let allCardList = player.deck.concat(
        player.hand,
        player.mannaPool,
        player.table,
        player.graveyard,
        opponent.deck,
        opponent.hand,
        opponent.mannaPool,
        opponent.table,
        opponent.graveyard
      );

      let allCards = {} as {[id: string]: Card};

      allCardList.forEach((card: Card) => {
        allCards[card.id] = card;
      });

      let newState = {
        player: {
          deck: returnIds(player.deck),
          hand: returnIds(player.hand),
          mannaPool: returnIds(player.mannaPool),
          table: returnIds(player.table),
          graveyard: returnIds(player.graveyard)
        },
        opponent: {
          deck: returnIds(opponent.deck),
          hand: returnIds(opponent.hand),
          mannaPool: returnIds(opponent.mannaPool),
          table: returnIds(opponent.table),
          graveyard: returnIds(opponent.graveyard)
        },
        allCards: allCards
      };

      return newState;
    }

    case getType(cardsActions.updateCards): {
      let player = action.payload.player;
      let opponent = action.payload.opponent;

      let allCardList = player.deck.concat(
        player.hand,
        player.mannaPool,
        player.table,
        player.graveyard,
        opponent.deck,
        opponent.hand,
        opponent.mannaPool,
        opponent.table,
        opponent.graveyard
      );

      let allCards = {} as {[id: string]: Card};

      allCardList.forEach((card: Card) => {
        card.position = state.allCards[card.id].position;
        allCards[card.id] = card;
      });

      let newState = {
        player: {
          deck: returnIds(player.deck),
          hand: returnIds(player.hand),
          mannaPool: returnIds(player.mannaPool),
          table: returnIds(player.table),
          graveyard: returnIds(player.graveyard)
        },
        opponent: {
          deck: returnIds(opponent.deck),
          hand: returnIds(opponent.hand),
          mannaPool: returnIds(opponent.mannaPool),
          table: returnIds(opponent.table),
          graveyard: returnIds(opponent.graveyard)

        },
        allCards: allCards
      };

      return newState;
    }

    case getType(cardsActions.cardPlaceChangePosition): {
      let card = state.allCards[action.payload.id];

      if (card) {
        let newCard = lodash.clone(card);
        let allCards = lodash.clone(state.allCards);

        newCard.position = {
          screenX: action.payload.x,
          screenY: action.payload.y
        };

        allCards[card.id] = newCard;

        state.allCards = allCards;

        return {...state};
      } else {
        return state;
      }
    }

    case getType(cardsActions.drawCard): {
      let card = state.allCards[action.payload.id];

      if (card) {
        let cardIndex = state.player.deck.indexOf(card.id);

        let newDeck = lodash.clone(state.player.deck);
        newDeck.splice(cardIndex, 1);

        let newHand = lodash.clone(state.player.hand);
        newHand.push(card.id);

        let newPlayer = lodash.clone(state.player);
        newPlayer.hand = newHand;
        newPlayer.deck = newDeck;

        return {...state, player: newPlayer};
      } else {
        return state;
      }
    }

    default:
      return state;
  }
};
