import * as React from 'react';
import styled from 'styled-components';
import { Card as CardData } from 'Features/cards/reducer';

const CardContainer = styled.div`
  display: inline-block;
  border: solid 1px;
  font-size: 12px;
`;

const UntappedCardBorder = styled.div`
  width: 60px;
  height: 100px;
`;

const TappedCardBorder = styled.div`
  width: 100px;
  height: 60px;
`;

export const Card = (props: CardData): JSX.Element => {
  const CardBorder = props.tapped ? TappedCardBorder : UntappedCardBorder;

  return (
    <CardContainer>
      <CardBorder>
        <div>{props.name}</div>
        <div>hp {props.alive ? props.currentHp + '/' : ''} {props.maxHp}</div>
        <div>damage {props.damage}</div>
        <div>manna {props.mannaCost}</div>
      </CardBorder>
    </CardContainer>
  );
};

export default Card;
