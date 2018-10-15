import * as React from 'react';
import { Dispatch } from 'redux';

import axios from 'axios';
import { connect } from 'react-redux';
import { cardsActions } from '../../store/cards/index';
import autobind from 'autobind-decorator';

import CardsLayer from '../CardsLayer/CardsLayer';
import { CardData } from '../../../typings/Cards';

import css from './Main.css';

// ВРЕМЕННО
import { UIBoard } from '../../../UIBoard/Game';
import { GameConstants } from '../../../../../game-server/src/domain/game/GameConstants';

let game: UIBoard;
// ВРЕМЕННО

interface Props {
  initCards: (params: GamePayload) => void;
  updateCards: (params: GamePayload) => void;
}

interface GameParams {
  playerId: string|null;
  gameId: string|null;
}

interface GamePayload {
  player: {
    deck: CardData[];
    hand: CardData[];
    mannaPool: CardData[];
    table: CardData[];
    graveyard: CardData[];
  };
  opponent: {
    deck: CardData[];
    hand: CardData[];
    mannaPool: CardData[];
    table: CardData[];
    graveyard: CardData[];
  };
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
class Main extends React.Component<Props> {
  gameParams: GameParams;

  constructor (props: Props) {
    super(props);
  }

  async componentDidMount (): Promise<void> {
    this.loadGameDataParams();
    this.initSockets();

    await this.initCards();
    // setTimeout(this.loadGameData.bind(this), 3000);
  }

  async initCards (): Promise<void> {
    let gamePayload = await this.loadGameData();
    this.props.initCards(gamePayload);

    game = new UIBoard(GameConstants.BOARD_WIDTH, GameConstants.BOARD_HEIGHT, gamePayload);
  }

  @autobind
  async updateCards (): Promise<void> {
    let gamePayload = await this.loadGameData();
    this.props.updateCards(gamePayload);

    game.updateGamePayload(gamePayload);
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
    let socket = (window as any).io('http://localhost:3000/' + this.gameParams.gameId);
    socket.on('connect', (): void => {
      console.log('socket connected');
      socket.emit('register', { playerId: this.gameParams.playerId });
    });

    socket.on('connect_timeout', async (data: any): Promise<void> => {
      console.log('connection timeout');
    });

    socket.on('error', async (error: any): Promise<void> => {
      console.error(error);
    });

    socket.on('event', async (data: any): Promise<void> => {
      console.log('server send event', data);

      this.updateCards();
    });

    socket.on('disconnect', function (): void {
      console.log('socket disconnect');
    });
  }

  async loadGameData (): Promise<GamePayload> {
    const serverPath = 'http://localhost:3000/';
    let response = await axios.get(`${serverPath}getGame?gameId=${this.gameParams.gameId}`);
    let data = response.data;

    let player = this.gameParams.playerId === data.player1.id ? data.player1 : data.player2;
    let opponent = this.gameParams.playerId === data.player2.id ? data.player1 : data.player2;

    return {player, opponent};
  }

  render (): JSX.Element {
    return (
      <div className={css.main}>
        <div className={css.mainContent}>
          <CardsLayer/>
          <div id='board'/>
        </div>
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

export {Main, GamePayload};
