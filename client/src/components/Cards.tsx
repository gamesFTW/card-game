import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import axios from 'axios';

import { cardsActions } from '../features/cards';
import { Card as CardData, PlayerCards } from '../features/cards/reducer';
import { Card } from './Card';
import CardPlace from './CardPlace';

interface Props {
  allCards: CardData[];
  drawCard: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Cards extends React.Component<Props> {
  constructor (props: Props) {
    super(props);
    console.log('Cards constructor');
  }

  render (): JSX.Element {
    return (
      <div>
        {this.props.allCards.map(
          (card: any) => {
            card.drawCard = this.props.drawCard;
            return Card(card);
          }
        )}
      </div>
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
    drawCard: (params: any) => dispatch(cardsActions.drawCard(params))
  };
}

export default Cards;
