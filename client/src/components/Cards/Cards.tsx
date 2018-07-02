import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { cardsActions } from '../../store/cards/index';
import { Card as CardData, PlayerCards } from '../../store/cards/reducer';
import CardsTemplate from './CardsTemplate';

interface Props {
  playerCards: PlayerCards;
  opponentCards: PlayerCards;
  allCards: CardData[];
  drawCard: (params: any) => any;
  cardPlaceChangePosition: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Cards extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <CardsTemplate {...this.props}/>
    );
  }
}

function mapStateToProps (state: any): any {
  return {
    playerCards: state.cards.player,
    opponentCards: state.cards.opponent,
    allCards: state.cards.allCards
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    initCards: (params: any) => dispatch(cardsActions.initCards(params)),
    updateCards: (params: any) => dispatch(cardsActions.updateCards(params)),
    drawCard: (params: any) => dispatch(cardsActions.drawCard(params)),
    cardPlaceChangePosition: (params: any) => dispatch(cardsActions.cardPlaceChangePosition(params))
  };
}

export default Cards;
