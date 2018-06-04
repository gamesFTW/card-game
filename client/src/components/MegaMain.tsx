import * as React from 'react';
import { Dispatch } from 'redux';

import Cards from './Cards';
import Main from './Main';
import axios from 'axios';
import { connect } from 'react-redux';
import { cardsActions } from '../features/cards';

interface Props {
  initCards: (params: any) => any;
  updateCards: (params: any) => any;
}

interface GameParams {
  playerId: string|null;
  gameId: string|null;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class MegaMain extends React.Component<Props> {
  gameParams: GameParams;

  constructor (props: Props) {
    super(props);

    let self = this;
    let params = new URLSearchParams(window.location.search);
    let playerId = params.get('playerId');
    let gameId = params.get('gameId');

    this.gameParams = {
      playerId,
      gameId
    };

    let socket = (window as any).io('http://localhost:3000');
    socket.on('connect', function (): void {
      console.log('socket connected');
      socket.emit('register', { playerId: playerId });
    });

    socket.on('event', async function (data: any): Promise<void> {
      console.log('server send event', data);
      let requestData = await self.loadGame();

      self.props.updateCards(requestData);
    });

    // socket.on('disconnect', function (): void {});
  }

  async componentDidMount (): Promise<void> {
    let data = await this.loadGame();

    this.props.initCards(data);

    // setTimeout(this.loadGame.bind(this), 3000);
  }

  async loadGame (): Promise<any> {
    const serverPath = 'http://localhost:3000/';
    let response = await axios.get(`${serverPath}getGame?gameId=${this.gameParams.gameId}`);
    let data = response.data;

    let player = this.gameParams.playerId === data.player1.id ? data.player1 : data.player2;
    let opponent = this.gameParams.playerId === data.player2.id ? data.player1 : data.player2;

    return {player, opponent};
  }

  render (): JSX.Element {
    return (
      <div>
        <Cards/>
        <Main/>
      </div>
    );
  }
}

function mapStateToProps (state: any): any {
  return {
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    initCards: (params: any) => dispatch(cardsActions.initCards(params)),
    updateCards: (params: any) => dispatch(cardsActions.updateCards(params))
  };
}

export default MegaMain;
