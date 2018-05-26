import { getType, getReturnOfExpression } from 'typesafe-actions';

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
  }
};

export const cardsReducer = (state: CardsState = initState, action: Action) => {
  switch (action.type) {
    case getType(cardsActions.initCards):
      return action.payload;

    default:
      return state;
  }
};
