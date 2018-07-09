import { combineReducers } from 'redux';
import { routerReducer as router, RouterState } from 'react-router-redux';

import { cardsReducer, CardsState } from './cards/reducer';

interface StoreEnhancerState { }

export interface RootState extends StoreEnhancerState {
  router: RouterState;
  cards: CardsState;
}

export const rootReducer = combineReducers<RootState>({
  router,
  cards: cardsReducer
});
