import * as React from 'react';
import { CardData } from '../../../../typings/Cards';
import css from './Card.css';

interface CardProps extends CardData {
  drawCard: (params: any) => any;
}

const Card = (props: CardProps): JSX.Element => {
  const isTappedClassName = props.tapped ? css.tappedCard : '';
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
    <div onClick={clickHandler} className={`${css.card} ${isTappedClassName}`} style={style} key={'card-' + props.id}>
      <b>{props.name}</b>
      <div>hp {props.alive ? props.currentHp + '/' : ''} {props.maxHp}</div>
      <div>damage {props.damage}</div>
      <div>manna {props.mannaCost}</div>
    </div>
  );
};

export {Card, CardProps};
