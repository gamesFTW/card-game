// Это нужно только для дебага

import { EntityId } from '../../../infr/Entity';
import { Board } from '../../../domain/board/Board';
import { Repository } from '../../../infr/repositories/Repository';
import { Card } from '../../../domain/card/Card';
import { Player } from '../../../domain/player/Player';

let getCards = async (array: Array<EntityId>, board: Board, repository: Repository) => {
  if (array.length === 0) {
    return [];
  }

  return await Promise.all(array.map(async (cardId: EntityId) => {
    let card = Object(await repository.get<Card>(cardId, Card)).state;
    let position = board.getPositionOfUnit(card);

    if (position) {
      card.x = position.x;
      card.y = position.y;
    }

    return card;
  }));
};

let fillPlayer = async (player: Player, board: Board, repository: Repository): Promise<any> => {
  let playerResponse = Object.assign({}, Object(player).state);
  playerResponse.deck = await getCards(playerResponse.deck, board, repository);
  playerResponse.hand = await getCards(playerResponse.hand, board, repository);
  playerResponse.manaPool = await getCards(playerResponse.manaPool, board, repository);
  playerResponse.table = await getCards(playerResponse.table, board, repository);
  playerResponse.graveyard = await getCards(playerResponse.graveyard, board, repository);

  return playerResponse;
};

export {fillPlayer};
