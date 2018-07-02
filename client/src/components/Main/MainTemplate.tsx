import * as React from 'react';

import Cards from '../Cards/Cards';

interface Props {
}

export class MainTemplate extends React.Component<Props> {
  render (): JSX.Element {
    return (
      <Cards/>
    );
  }
}

export default MainTemplate;
