import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import { Card as CardData } from '../store/cards/reducer';
import { cardsActions } from '../store/cards';

// const {whyDidYouUpdate} = require('why-did-you-update');
// whyDidYouUpdate(React, { groupByComponent: true, collapseComponentGroups: true });

const CardPlaceContainer = styled.div`
  display: inline-block;
  width: 60px;
  height: 100px;
  margin: 0 4px;
  
  box-shadow: inset 0 0 2px #00000040;
`;

interface CardPlaceData extends CardData {
  cardPlaceChangePosition: (params: any) => any;
}

export class CardPlace extends React.Component<CardPlaceData> {
  constructor (props: CardPlaceData) {
    super(props);
  }

  componentDidMount (): void {
    this.refreshPosition();
  }

  componentDidUpdate (): void {
    this.refreshPosition();
  }

  // shouldComponentUpdate (nextProps: any, nextState: any): void {
  //   console.log(nextProps);
  // }

  refreshPosition (): void {
    let element = ReactDOM.findDOMNode(this);
    let position = element.getBoundingClientRect();

    this.props.cardPlaceChangePosition(
      {id: this.props.id, x: position.left, y: position.top}
    );
  }

  render (): JSX.Element {
    return (
      <CardPlaceContainer/>
    );
  }
}

export default CardPlace;
