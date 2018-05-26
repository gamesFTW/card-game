import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import axios from 'axios';

import { cardsActions } from '../features/cards';
import { Card as CardData, PlayerCards } from '../features/cards/reducer';
import { Card } from './Card';

interface Props {
  player: PlayerCards;
  opponent: PlayerCards;
  initCards: (params: any) => any;
}

interface State {
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Main extends React.Component<Props, State> {

  async componentDidMount (): Promise<void> {
    const gameId = '49yqm5m1nrn136ab11c9lydei41nfu';
    const serverPath = 'http://localhost:3000/';

    let response = await axios.get(`${serverPath}getGame?gameId=${gameId}`);

    this.props.initCards({
      player: response.data.player1,
      opponent: response.data.player2
    });
  }

  render (): JSX.Element {
    return (
      <div>
        <div>
          <div>Player</div>
          <div>Deck</div>
          <div>{this.props.player.deck.map(Card)}</div>
          <div>Hand</div>
          <div>{this.props.player.hand.map(Card)}</div>
          <div>Manna Pool</div>
          <div>{this.props.player.mannaPool.map(Card)}</div>
          <div>Table</div>
          <div>{this.props.player.table.map(Card)}</div>
          <div>Graveyard</div>
          <div>{this.props.player.graveyard.map(Card)}</div>
        </div>

        <br/>

        <div>
          <div>Opponent</div>
          <div>Deck</div>
          <div>{this.props.opponent.deck.map(Card)}</div>
          <div>Hand</div>
          <div>{this.props.opponent.hand.map(Card)}</div>
          <div>Manna Pool</div>
          <div>{this.props.opponent.mannaPool.map(Card)}</div>
          <div>Table</div>
          <div>{this.props.opponent.table.map(Card)}</div>
          <div>Graveyard</div>
          <div>{this.props.opponent.graveyard.map(Card)}</div>
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
    initCards: (params: any) => dispatch(cardsActions.initCards(params))
  };
}

export default Main;
