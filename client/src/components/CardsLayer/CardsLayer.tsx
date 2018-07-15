import * as React from 'react';

import { Cards } from './Cards/Cards';
import { Placeholders } from './Placeholders/Placeholders';

interface Props {
}

export class CardsLayer extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <div>
        <Cards />
        <Placeholders />
      </div>
    );
  }
}

export default CardsLayer;
