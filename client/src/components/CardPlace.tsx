import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import { Card as CardData } from '../features/cards/reducer';
import { cardsActions } from '../features/cards';

const CardPlaceContainer = styled.div`
  display: inline-block;
  width: 60px;
  height: 100px;
  // background: gray;
  margin: 0 4px;
`;

interface CardPlaceData extends CardData {
  cardPlaceChangePosition: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class CardPlace extends React.Component<CardPlaceData> {
  componentDidMount (): void {
    this.refreshPosition();
  }

  componentDidUpdate (): void {
    this.refreshPosition();
  }

  refreshPosition (): void {
    let element = ReactDOM.findDOMNode(this);
    let position = element.getBoundingClientRect();

    this.props.cardPlaceChangePosition(
      {id: this.props.id, x: position.left, y: position.top}
    );
  }

  render (): JSX.Element {
    return (
      <CardPlaceContainer>
      </CardPlaceContainer>
    );
  }
}

function mapStateToProps (state: any): any {
  return {
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    cardPlaceChangePosition: (params: any) => dispatch(cardsActions.cardPlaceChangePosition(params))
  };
}

export default CardPlace;
