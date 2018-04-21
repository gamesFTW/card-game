// Это нужно только для дебага

import { Card } from '../../domain/card/Card';
import { Player } from '../../domain/player/Player';
import { EntityId } from '../../infr/Entity';
import { Repository } from '../../infr/repositories/Repository';

let getCards = async (array: Array<EntityId>) => {
  if (array.length === 0) {
    return [];
  }

  return await Promise.all(array.map(async (cardId: EntityId) => {
    let card = await Repository.get<Card>(cardId, Card);

    return JSON.stringify(Object(card).state).replace(/"/g, '\'');
  }));
};

let mapPlayer = async (player: Player): Promise<any> => {
  let playerResponse = Object(player).state;
  playerResponse.deck = await getCards(playerResponse.deck);
  playerResponse.hand = await getCards(playerResponse.hand);
  playerResponse.mannaPool = await getCards(playerResponse.mannaPool);
  playerResponse.table = await getCards(playerResponse.table);
  playerResponse.graveyard = await getCards(playerResponse.graveyard);

  return JSON.stringify(playerResponse, undefined, 2);
};

export {mapPlayer};
