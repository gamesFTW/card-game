import { Event } from '../../infr/Event';
import { Entity, EntityId } from '../../infr/Entity';

import { GameData, GameState } from './GameState';
import { Player } from '../player/Player';
import { Card, CardCreationData } from '../card/Card';
import * as lodash from 'lodash';
import { GameEventType } from '../events';
import { Field } from '../field/Field';
import { GameConstants } from './GameConstants';

class Game extends Entity {
  protected state: GameState;

  get player1Id (): EntityId { return this.state.player1Id; }
  get player2Id (): EntityId { return this.state.player2Id; }
  get currentPlayersTurn (): EntityId { return this.state.currentPlayersTurn; }
  get fieldId (): EntityId { return this.state.fieldId; }

  constructor (events: Array<Event<GameData>> = []) {
    super();
    this.state = new GameState(events);
  }

  public create (playerACardsData: Array<CardCreationData>, playerBCardsData: Array<CardCreationData>): {
    player1: Player, player2: Player, player1Cards: Array<Card>, player2Cards: Array<Card>, field: Field
  } {
    let id = this.generateId();

    let field = new Field();
    field.create(GameConstants.FIELD_WIDTH, GameConstants.FIELD_HEIGHT);

    // Более красивее было бы сначала создать игроков и потом их зашафлить.
    let playersCardsData = lodash.shuffle([playerACardsData, playerBCardsData]);

    let {player: player1, cards: player1Cards} = this.createPlayer(playersCardsData[0], true);
    let {player: player2, cards: player2Cards} = this.createPlayer(playersCardsData[1], false);

    this.applyEvent(new Event<GameData>(
      GameEventType.GAME_CREATED,
      {
        id,
        player1Id: player1.id,
        player2Id: player2.id,
        currentPlayersTurn: player1.id,
        fieldId: field.id
      }
    ));

    player1.startTurn();

    return {player1, player2, player1Cards, player2Cards, field};
  }

  public endTurn (
    endingTurnPlayer: Player,
    endingTurnPlayerOpponent: Player,
    endingTurnPlayerMannaPoolCards: Array<Card>,
    endingTurnPlayerTableCards: Array<Card>
  ): void {
    endingTurnPlayer.endTurn(endingTurnPlayerMannaPoolCards, endingTurnPlayerTableCards);

    this.applyEvent(new Event<GameData>(
      GameEventType.TURN_ENDED,
      {currentPlayersTurn: endingTurnPlayerOpponent.id, currentTurn: this.state.currentTurn + 1}
    ));

    endingTurnPlayerOpponent.startTurn();
  }

  public getPlayerIdWhichIsOpponentFor (playerId: EntityId): EntityId {
    return playerId === this.state.player1Id ? this.state.player2Id : this.state.player1Id;
  }

  private createPlayer (cardsCreationData: Array<CardCreationData>, handicap: boolean):
      {player: Player, cards: Array<Card>} {
    let player = new Player();
    let {cards} = player.create(cardsCreationData, handicap);

    return {player, cards};
  }
}

export {Game};
