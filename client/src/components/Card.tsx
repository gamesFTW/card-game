import * as React from 'react';

export interface CardProps {
  name: string;
}

export const Card = (props: CardProps): JSX.Element => {
  return (
    <div>
      Карта: {props.name}
    </div>
  );
};

export default Card;
