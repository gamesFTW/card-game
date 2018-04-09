import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { GameState } from './GameState';
import { GameCreated } from './GameEvents';
import { Player } from '../player/Player';
import { Card, CardCreationData } from '../card/Card';
import * as lodash from 'lodash';

class Game extends Entity {
  protected state: GameState;

  get player1Id (): EntityId { return this.state.player1Id; }
  get player2Id (): EntityId { return this.state.player2Id; }

  constructor (events: Array<Event> = []) {
    super();
    this.state = new GameState(events);
  }

  public create (playerACardsData: Array<CardCreationData>, playerBCardsData: Array<CardCreationData>): {
    player1: Player, player2: Player, player1Cards: Array<Card>, player2Cards: Array<Card>
  } {
    let id = this.generateId();

    // Более красивее было бы сначала создать игроков и потом их зашафлить.
    let playersCardsData = lodash.shuffle([playerACardsData, playerBCardsData]);

    let {player: player1, cards: player1Cards} = this.createPlayer(playersCardsData[0], true);
    let {player: player2, cards: player2Cards} = this.createPlayer(playersCardsData[1], false);

    this.applyEvent(new GameCreated(
      {id, player1Id: player1.id, player2Id: player2.id, currentPlayersTurn: player1.id}
    ));

    return {player1, player2, player1Cards, player2Cards};
  }

  private createPlayer (cardsCreationData: Array<CardCreationData>, handicap: boolean):
      {player: Player, cards: Array<Card>} {
    let player = new Player();
    let {cards} = player.create(cardsCreationData, handicap);

    return {player, cards};
  }
}

export {Game};
