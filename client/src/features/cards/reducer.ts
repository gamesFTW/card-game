import { combineReducers } from 'redux';
import { getType, getReturnOfExpression } from 'typesafe-actions';

import * as cardsActions from './actions';
const returnsOfActions = Object.values(cardsActions).map(getReturnOfExpression);
export type Action = typeof returnsOfActions[number];

// Не правильно хранить тут такие типы.
export type Card = {
  name: string;
};

export type CardsState = Card[];

export const cardsReducer = (state: any = [], action: Action) => {
  switch (action.type) {
    case getType(cardsActions.addCard):
      return state.concat(action.payload);

    default:
      return state;
  }
};
