import { getType, getReturnOfExpression } from 'typesafe-actions';
import lodash from 'lodash';

import * as cardsActions from './actions';
const returnsOfActions = Object.values(cardsActions).map(getReturnOfExpression);
export type Action = typeof returnsOfActions[number];

// Не правильно хранить тут такие типы.
export type Card = {
  id?: string;
  name?: string;
  maxHp?: number;
  currentHp?: number;
  damage?: number;
  alive?: boolean;
  tapped?: boolean;
  mannaCost?: number;
  movingPoints?: number;
  currentMovingPoints?: number;
  screenX?: number;
  screenY?: number;
};

export type PlayerCards = {
  deck: Card[];
  hand: Card[];
  mannaPool: Card[];
  table: Card[];
  graveyard: Card[];
};

export type CardsState = {
  player: PlayerCards;
  opponent: PlayerCards;
  allCards: Card[];
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
  allCards: []
};

export const cardsReducer = (state: CardsState = initState, action: Action) => {
  switch (action.type) {
    case getType(cardsActions.initCards):
      let player = lodash.cloneDeep(action.payload.player);
      let opponent = lodash.cloneDeep(action.payload.opponent);

      let allCards = player.deck
        .concat(player.hand)
        .concat(player.mannaPool)
        .concat(player.table)
        .concat(player.graveyard)
        .concat(opponent.deck)
        .concat(opponent.hand)
        .concat(opponent.mannaPool)
        .concat(opponent.table)
        .concat(opponent.graveyard);

      let newState = lodash.cloneDeep(action.payload);
      newState.allCards = allCards;
      return newState;

    case getType(cardsActions.cardPlaceChangePosition): {
      let newState = lodash.cloneDeep(state);
      let card = lodash.find(newState.allCards, (card) => card.id === action.payload.id);

      if (card) {
        card.screenX = action.payload.x;
        card.screenY = action.payload.y;
      }
      return newState;
    }
    default:
      return state;
  }
};
