import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import axios from 'axios';

import { cardsActions } from '../features/cards';
import { Card as CardData, PlayerCards } from '../features/cards/reducer';
import { Card } from './Card';
import CardPlace from './CardPlace';
import Cards from './Cards';

interface Props {
  player: PlayerCards;
  opponent: PlayerCards;
  cardPlaceChangePosition: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Main extends React.Component<Props> {
  componentWillReceiveProps (): void {
  }

  render (): JSX.Element {
    let CardPlaceContainer = (cardData: CardData) => {
      let params = {
        id: cardData.id,
        cardPlaceChangePosition: this.props.cardPlaceChangePosition
      };
      return (<CardPlace {...params} key={'card-place-' + cardData.id}/>);
    };

    let style = {
      display: 'flex'
    };

    let style2 = {
      width: '50%'
    };

    return (
      <div>
        <div style={style}>
          <div style={style2}>
            <div>Player</div>
            <div>Deck</div>
            <div>{this.props.player.deck.map(CardPlaceContainer)}</div>
            <div>Hand</div>
            <div>{this.props.player.hand.map(CardPlaceContainer)}</div>
            <div>Manna Pool</div>
            <div>{this.props.player.mannaPool.map(CardPlaceContainer)}</div>
            <div>Table</div>
            <div>{this.props.player.table.map(CardPlaceContainer)}</div>
            <div>Graveyard</div>
            <div>{this.props.player.graveyard.map(CardPlaceContainer)}</div>
          </div>

          <div style={style2}>
            <div>Opponent</div>
            <div>Deck</div>
            <div>{this.props.opponent.deck.map(CardPlaceContainer)}</div>
            <div>Hand</div>
            <div>{this.props.opponent.hand.map(CardPlaceContainer)}</div>
            <div>Manna Pool</div>
            <div>{this.props.opponent.mannaPool.map(CardPlaceContainer)}</div>
            <div>Table</div>
            <div>{this.props.opponent.table.map(CardPlaceContainer)}</div>
            <div>Graveyard</div>
            <div>{this.props.opponent.graveyard.map(CardPlaceContainer)}</div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps (state: any): any {
  return {
    player: state.cards.player,
    opponent: state.cards.opponent
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    cardPlaceChangePosition: (params: any) => dispatch(cardsActions.cardPlaceChangePosition(params))
  };
}

export default Main;
