import * as React from 'react';

import { Cards } from './Cards/Cards';
import { Placeholders } from './Placeholders/Placeholders';
import css from './CardsLayer.css';

interface Props {
}

export class CardsLayer extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <div className={css.cardsLayer}>
        <Cards />
        <Placeholders />
      </div>
    );
  }
}

export default CardsLayer;
