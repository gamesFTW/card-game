import * as React from 'react';

import CardPlaceholder from '../Cards/CardPlaceholders/CardPlaceholder';
import {Card as CardData, PlayerCards} from '../../store/cards/reducer';
import { Card } from './Card/Card';

interface Props {
  playerCards: PlayerCards;
  opponentCards: PlayerCards;
  allCards: CardData[];
  drawCard: (params: any) => any;
  cardPlaceChangePosition: (params: any) => any;
}

export class CardsTemplate extends React.Component<Props> {
  render (): JSX.Element {
    let CardPlaceContainer = (cardId: string) => {
      let params = {
        id: cardId,
        cardPlaceChangePosition: this.props.cardPlaceChangePosition
      };
      return (<CardPlaceholder {...params} key={'card-place-' + cardId}/>);
    };

    let style = {
      display: 'flex'
    };

    let style2 = {
      width: '50%'
    };

    return (
      <div>
        <div>
          {Object.keys(this.props.allCards).map(
            (cardId: any) => {
              let card: any = {
                ...this.props.allCards[cardId],
                drawCard: this.props.drawCard
              };

              return Card(card);
            }
          )}
        </div>

        <div style={style}>
          <div style={style2}>
            <div>Player</div>
            <div>Deck</div>
            <div>{this.props.playerCards.deck.map(CardPlaceContainer)}</div>
            <div>Hand</div>
            <div>{this.props.playerCards.hand.map(CardPlaceContainer)}</div>
            <div>Manna Pool</div>
            <div>{this.props.playerCards.mannaPool.map(CardPlaceContainer)}</div>
            <div>Table</div>
            <div>{this.props.playerCards.table.map(CardPlaceContainer)}</div>
            <div>Graveyard</div>
            <div>{this.props.playerCards.graveyard.map(CardPlaceContainer)}</div>
          </div>

          <div style={style2}>
            <div>Opponent</div>
            <div>Deck</div>
            <div>{this.props.opponentCards.deck.map(CardPlaceContainer)}</div>
            <div>Hand</div>
            <div>{this.props.opponentCards.hand.map(CardPlaceContainer)}</div>
            <div>Manna Pool</div>
            <div>{this.props.opponentCards.mannaPool.map(CardPlaceContainer)}</div>
            <div>Table</div>
            <div>{this.props.opponentCards.table.map(CardPlaceContainer)}</div>
            <div>Graveyard</div>
            <div>{this.props.opponentCards.graveyard.map(CardPlaceContainer)}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default CardsTemplate;
