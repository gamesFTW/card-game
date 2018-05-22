// Это нужно только для дебага

import { Card } from '../../domain/card/Card';
import { Player } from '../../domain/player/Player';
import { EntityId } from '../../infr/Entity';
import { Repository } from '../../infr/repositories/Repository';
import { Field } from '../../domain/field/Field';

let getCards = async (array: Array<EntityId>, field: Field) => {
  if (array.length === 0) {
    return [];
  }

  return await Promise.all(array.map(async (cardId: EntityId) => {
    let card = Object(await Repository.get<Card>(cardId, Card)).state;
    let position = field.getPositionByUnit(card);

    if (position) {
      card.x = position.x;
      card.y = position.y;
    }

    return JSON.stringify(card).replace(/"/g, '\'');
  }));
};

let mapPlayer = async (player: Player, field: Field): Promise<any> => {
  let playerResponse = Object.assign({}, Object(player).state);
  playerResponse.deck = await getCards(playerResponse.deck, field);
  playerResponse.hand = await getCards(playerResponse.hand, field);
  playerResponse.mannaPool = await getCards(playerResponse.mannaPool, field);
  playerResponse.table = await getCards(playerResponse.table, field);
  playerResponse.graveyard = await getCards(playerResponse.graveyard, field);

  return JSON.stringify(playerResponse, undefined, 2);
};

export {mapPlayer};
