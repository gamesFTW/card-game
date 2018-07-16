import { createAction } from 'typesafe-actions';

const INIT_CARDS = 'INIT_CARDS';
const CARD_PLACE_CHANGE_POSITION = 'CARD_PLACE_CHANGE_POSITION';
const DRAW_CARD = 'DRAW_CARD';
const UPDATE_CARDS = 'UPDATE_CARDS';

export const initCards = createAction(INIT_CARDS, (params: any) => ({
  type: INIT_CARDS, payload: params
}));

export const cardPlaceChangePosition = createAction(CARD_PLACE_CHANGE_POSITION, (params: any) => ({
  type: CARD_PLACE_CHANGE_POSITION, payload: params
}));

export const drawCard = createAction(DRAW_CARD, (params: any) => ({
  type: DRAW_CARD, payload: params
}));

export const updateCards = createAction(UPDATE_CARDS, (params: any) => ({
  type: UPDATE_CARDS, payload: params
}));
