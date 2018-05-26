import { createAction } from 'typesafe-actions';

const INIT_CARDS = 'INIT_CARDS';

export const initCards = createAction(INIT_CARDS, (params: any) => ({
  type: INIT_CARDS, payload: params
}));
