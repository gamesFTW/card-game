import * as React from 'react';
import { Dispatch } from 'redux';

import axios from 'axios';
import { connect } from 'react-redux';
import { cardsActions } from '../../store/cards/index';

import CardsLayer from '../CardsLayer/CardsLayer';

// ВРЕМЕННО
import { Game } from '../../../UIField/Game';
let game;
// ВРЕМЕННО

interface Props {
  initCards: (params: any) => any;
  updateCards: (params: any) => any;
}

interface GameParams {
  playerId: string|null;
  gameId: string|null;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Main extends React.Component<Props> {
  gameParams: GameParams;

  constructor (props: Props) {
    super(props);
  }

  async componentDidMount (): Promise<void> {
    this.loadGameDataParams();
    this.initSockets();

    let data = await this.loadGameData();
    this.props.initCards(data);

    game = new Game(10, 10);

    // setTimeout(this.loadGameData.bind(this), 3000);
  }

  loadGameDataParams (): void {
    let params = new URLSearchParams(window.location.search);
    let playerId = params.get('playerId');
    let gameId = params.get('gameId');

    this.gameParams = {
      playerId,
      gameId
    };
  }

  initSockets (): void {
    let socket = (window as any).io('http://localhost:3000');
    socket.on('connect', (): void => {
      console.log('socket connected');
      socket.emit('register', { playerId: this.gameParams.playerId });
    });

    socket.on('event', async (data: any): Promise<void> => {
      console.log('server send event', data);
      let requestData = await this.loadGameData();

      this.props.updateCards(requestData);
    });

    // socket.on('disconnect', function (): void {});
  }

  async loadGameData (): Promise<any> {
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
        {/*<CardsLayer/>*/}
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

export default Main;
