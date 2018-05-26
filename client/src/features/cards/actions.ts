import { createAction } from 'typesafe-actions';

const ADD_CARD = 'ADD_CARD';

export const addCard = createAction(ADD_CARD, (cards: any) => ({
  type: ADD_CARD, payload: cards,
}));
