import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CardData as CardData } from '../../../store/cards/reducer';

import css from './Placeholder.css';

interface CardPlaceData extends CardData {
  cardPlaceChangePosition: (params: any) => any;
}

export class Placeholder extends React.Component<CardPlaceData> {
  constructor (props: CardPlaceData) {
    super(props);
  }

  componentDidMount (): void {
    // TODO: Уходит в бесконечный абдейт.
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

    this.props.cardPlaceChangePosition(
      {id: this.props.id, x: element.offsetLeft, y: element.offsetTop}
    );
  }

  render (): JSX.Element {
    return (
      <div className={css.placeholder}/>
    );
  }
}

export default Placeholder;
