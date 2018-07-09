import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { cardsActions } from '../../../store/cards/index';
import { Card as CardData } from '../../../store/cards/reducer';
import CardsTemplate from './CardsTemplate';

interface Props {
  allCards: CardData[];
  drawCard: (params: any) => any;
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
    allCards: state.cards.allCards
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    drawCard: (params: any) => dispatch(cardsActions.drawCard(params)),
  };
}

export default Cards;
