import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { cardsActions } from '../../../store/cards/index';
import { PlayerCards } from '../../../store/cards/reducer';
import { Placeholder } from './Placeholder';
import { PlayerPlaceholders } from './PlayerPlaceholders';

interface Props {
  playerCards: PlayerCards;
  opponentCards: PlayerCards;
  cardPlaceChangePosition: (params: any) => any;
}

@(connect(mapStateToProps, mapDispatchToProps) as any)
export class Placeholders extends React.Component<Props> {
  render (): JSX.Element {

    return (
      <div>
        <PlayerPlaceholders
          title='Player'
          cardsPlaceholders={this.props.playerCards}
          cardPlaceChangePosition={this.props.cardPlaceChangePosition}
        />
        <PlayerPlaceholders
          title='Opponent'
          cardsPlaceholders={this.props.opponentCards}
          cardPlaceChangePosition={this.props.cardPlaceChangePosition}
        />
      </div>
    );
  }
}

function mapStateToProps (state: any): any {
  return {
    playerCards: state.cards.player,
    opponentCards: state.cards.opponent
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): any {
  return {
    cardPlaceChangePosition: (params: any) => dispatch(cardsActions.cardPlaceChangePosition(params))
  };
}

export default Placeholders;
