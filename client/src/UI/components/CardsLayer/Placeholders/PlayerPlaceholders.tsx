import * as React from 'react';

import { PlayerCards } from '../../../store/cards/reducer';
import { Placeholder } from './Placeholder';
import { FaceUpCard } from '../Cards/FaceUpCard';
import css from './PlayerPlaceholders.css';

interface Props {
  owner: string;
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

    let ownerClassName = this.props.owner === 'player' ? css.player : css.opponent;

    return (
        <div className={`${css.PlayerPlaceholders} ${ownerClassName}`}>
          <div className={css.deck}><FaceUpCard/></div>
          <div className={css.hand}>{this.props.cardsPlaceholders.hand.map(CardPlaceContainer)}</div>
          <div className={css.mannaPool}>{this.props.cardsPlaceholders.mannaPool.map(CardPlaceContainer)}</div>
          <div className={css.table}>{this.props.cardsPlaceholders.table.map(CardPlaceContainer)}</div>
          <div className={css.graveyard}>{this.props.cardsPlaceholders.graveyard.map(CardPlaceContainer)}</div>
        </div>
    );
  }
}

export default PlayerPlaceholders;
