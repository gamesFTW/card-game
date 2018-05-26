import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { cardsActions } from '../features/cards';
import { Card as CardData } from 'Features/cards/reducer';
import { Card } from './Card';

interface Props {
  cards: CardData[];
  addCards: (cards: [{}]) => any;
}

interface State {
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Main extends React.Component<Props, State> {

  componentDidMount() {
    // Типа сделали асинхронный запрос.
    const objectFromServer: any = {cards: [{name: 'orc'}, {name: 'elf'}]};

    this.props.addCards(objectFromServer.cards);
    this.props.addCards(objectFromServer.cards);
  }

  render() {
    return (
      <div>
        {this.props.cards.map(Card)}
      </div>
    );
  }
}

function mapStateToProps(state: any): any {
  return {
    cards: state.cards
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): any {
  return {
    addCards: (params: any) => dispatch(cardsActions.addCard(params))
  };
}

export default Main;
