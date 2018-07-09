import * as React from 'react';

import {Card as CardData } from '../../../store/cards/reducer';
import { Card } from './Card/Card';

interface Props {
  allCards: CardData[];
  drawCard: (params: any) => any;
}

export class CardsLayerTemplate extends React.Component<Props> {
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

export default CardsLayerTemplate;
