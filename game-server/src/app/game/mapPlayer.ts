// Это нужно только для дебага

import { Card } from '../../domain/card/Card';
import { Player } from '../../domain/player/Player';
import { EntityId } from '../../infr/Entity';
import { Repository } from '../../infr/repositories/Repository';
import { Board } from '../../domain/board/Board';

let getCards = async (array: Array<EntityId>, board: Board) => {
  if (array.length === 0) {
    return [];
  }

  return await Promise.all(array.map(async (cardId: EntityId) => {
    let card = Object(await Repository.get<Card>(cardId, Card)).state;
    let position = board.getPositionByUnit(card);

    if (position) {
      card.x = position.x;
      card.y = position.y;
    }

    return card;
  }));
};

let mapPlayer = async (player: Player, board: Board): Promise<any> => {
  let playerResponse = Object.assign({}, Object(player).state);
  playerResponse.deck = await getCards(playerResponse.deck, board);
  playerResponse.hand = await getCards(playerResponse.hand, board);
  playerResponse.manaPool = await getCards(playerResponse.manaPool, board);
  playerResponse.table = await getCards(playerResponse.table, board);
  playerResponse.graveyard = await getCards(playerResponse.graveyard, board);

  return playerResponse;
};

export {mapPlayer};
