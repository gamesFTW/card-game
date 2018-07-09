import * as React from 'react';

import CardsLayerTemplate from '../CardsLayer/CardsLayerTemplate';

interface Props {
}

export class MainTemplate extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <CardsLayerTemplate/>
    );
  }
}

export default MainTemplate;
