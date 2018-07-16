import * as React from 'react';

import { PlayerCards } from '../../../store/cards/reducer';
import { Placeholder } from './Placeholder';

interface Props {
  title: string;
  cardsPlaceholders: PlayerCards;
  cardPlaceChangePosition: (params: any) => any;
}

export class PlayerPlaceholders extends React.Component<Props> {
  render (): JSX.Element {
    let CardPlaceContainer = (cardId: string) => {
      let params = {
        id: cardId,
        cardPlaceChangePosition: this.props.cardPlaceChangePosition
      };
      return (<Placeholder {...params} key={'card-place-' + cardId}/>);
    };

    return (
        <div>
          <h3>{this.props.title}</h3>
          <div>Deck</div>
          <div>{this.props.cardsPlaceholders.deck.map(CardPlaceContainer)}</div>
          <div>Hand</div>
          <div>{this.props.cardsPlaceholders.hand.map(CardPlaceContainer)}</div>
          <div>Manna Pool</div>
          <div>{this.props.cardsPlaceholders.mannaPool.map(CardPlaceContainer)}</div>
          <div>Table</div>
          <div>{this.props.cardsPlaceholders.table.map(CardPlaceContainer)}</div>
          <div>Graveyard</div>
          <div>{this.props.cardsPlaceholders.graveyard.map(CardPlaceContainer)}</div>
        </div>
    );
  }
}

export default PlayerPlaceholders;
