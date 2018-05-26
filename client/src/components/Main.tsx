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

  constructor (props: Props) {
    super(props);

    let self = this;
    let params = new URLSearchParams(window.location.search);
    let playerId = params.get('playerId');
    let gameId = params.get('gameId');

    let socket = io('http://localhost:3000');
    socket.on('connect', function () {
      console.log('connect');
      socket.emit('register', { playerId, gameId });
    });

    socket.on('event', function (data: any): void {
      console.log('server send event', data);
      self.loadGame();
    });

    socket.on('disconnect', function(){});
  }

  async componentDidMount (): Promise<void> {
    await this.loadGame();
  }

  async loadGame (): Promise<void> {
    let params = new URLSearchParams(window.location.search);
    let gameId = params.get('gameId');
    let playerId = params.get('playerId');

    const serverPath = 'http://localhost:3000/';

    let response = await axios.get(`${serverPath}getGame?gameId=${gameId}`);

    let player = playerId === response.data.player1.id ? response.data.player1 : response.data.player2;
    let opponent = playerId === response.data.player2.id ? response.data.player1 : response.data.player2;

    this.props.initCards({
      player: player,
      opponent: opponent
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
