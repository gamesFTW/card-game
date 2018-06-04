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
  // allCards: CardData[];
  player: PlayerCards;
  opponent: PlayerCards;
  initCards: (params: any) => any;
  cardPlaceChangePosition: (params: any) => any;
  drawCard: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Main extends React.Component<Props> {
  constructor (props: Props) {
    super(props);

    let self = this;
    let params = new URLSearchParams(window.location.search);
    let playerId = params.get('playerId');

    let socket = (window as any).io('http://localhost:3000');
    socket.on('connect', function (): void {
      console.log('socket connected');
      socket.emit('register', { playerId: playerId });
    });

    socket.on('event', function (data: any): void {
      console.log('server send event', data);
      self.loadGame();
    });

    // socket.on('disconnect', function (): void {});
  }

  async componentDidMount (): Promise<void> {
    console.log('Main componentDidMount');
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

  componentWillReceiveProps (): void {
    console.log('Main componentWillReceiveProps');
  }

  render (): JSX.Element {
    console.log('Main render');
    let CardPlaceContainer = (cardData: CardData) => {
      let params = {
        id: cardData.id,
        cardPlaceChangePosition: this.props.cardPlaceChangePosition,
        drawCard: this.props.drawCard
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
        <div>
          <Cards/>
        </div>

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
    // allCards: state.cards.allCards,
    player: state.cards.player,
    opponent: state.cards.opponent
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    initCards: (params: any) => dispatch(cardsActions.initCards(params)),
    cardPlaceChangePosition: (params: any) => dispatch(cardsActions.cardPlaceChangePosition(params)),
    drawCard: (params: any) => dispatch(cardsActions.drawCard(params))
  };
}

export default Main;
