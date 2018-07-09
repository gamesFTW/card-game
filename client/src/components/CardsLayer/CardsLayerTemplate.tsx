import * as React from 'react';

import { Cards } from './Cards/Cards';
import { CardsPlaceholders } from './CardsPlaceholders/CardsPlaceholders';

interface Props {
}

export class CardsLayerTemplate extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <div>
        <Cards />

        <CardsPlaceholders /> 
      </div>
    );
  }
}

export default CardsLayerTemplate;