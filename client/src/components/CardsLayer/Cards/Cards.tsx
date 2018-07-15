import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { cardsActions } from '../../../store/cards/index';
import { Card as CardData } from '../../../store/cards/reducer';
import { Card } from './Card';

interface Props {
  allCards: CardData[];
  drawCard: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Cards extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <div>
        {Object.keys(this.props.allCards).map(
          (cardId: any) => {
            let card: any = {
              ...this.props.allCards[cardId],
              drawCard: this.props.drawCard
            };

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
    drawCard: (params: any) => dispatch(cardsActions.drawCard(params)),
  };
}

export default Cards;
