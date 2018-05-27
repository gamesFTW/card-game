import { createAction } from 'typesafe-actions';

const INIT_CARDS = 'INIT_CARDS';
const CARD_PLACE_CHANGE_POSITION = 'CARD_PLACE_CHANGE_POSITION';

export const initCards = createAction(INIT_CARDS, (params: any) => ({
  type: INIT_CARDS, payload: params
}));

export const cardPlaceChangePosition = createAction(CARD_PLACE_CHANGE_POSITION, (params: any) => ({
  type: CARD_PLACE_CHANGE_POSITION, payload: params
}));
