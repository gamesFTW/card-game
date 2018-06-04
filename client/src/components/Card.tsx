import * as React from 'react';
import styled from 'styled-components';
import { Card as CardData } from 'Features/cards/reducer';

const CardContainer = styled.div`
  display: inline-block;
  border: solid 1px gray;
  font-size: 10px;
  position: absolute;
  transition: all 1.5s ease-out;
  left: 0;
  top: 0;
  border-radius: 2px;
  box-shadow: 0 0 1px #00000040;
  font-family: sans-serif;
  width: 54px;
  height: 94px;
  padding: 3px;
  background: white;
`;

const TappedCardContainer = CardContainer.extend`
  transform-origin: top left;
  transform: rotate(90deg) translateY(-100%);
`;

interface CardPlaceData extends CardData {
  drawCard: (params: any) => any;
}

export const Card = (props: CardPlaceData): JSX.Element => {
  const Container = props.tapped ? TappedCardContainer : CardContainer;
  let style;

  if (props.position) {
    style = {
      'left': props.position.screenX,
      'top': props.position.screenY
    };
  } else {
    style = {
      'left': 0,
      'top': 0
    };
  }

  function clickHandler (): void {
    props.drawCard({id: props.id});
  }

  return (
    <Container onClick={clickHandler} style={style} key={'card-' + props.id}>
      <b>{props.name}</b>
      <div>hp {props.alive ? props.currentHp + '/' : ''} {props.maxHp}</div>
      <div>damage {props.damage}</div>
      <div>manna {props.mannaCost}</div>
    </Container>
  );
};

export default Card;
