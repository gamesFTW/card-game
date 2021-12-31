import { Entity, EntityId } from '../infr/Entity';
import { GameSituation } from './MakeAITurnUseCase';


function getEntityFromGameSituation<EntityClass extends Entity>(entityId: EntityId, gameSituation: GameSituation): EntityClass {
  return gameSituation[entityId] as EntityClass;
}

function getEntitiesFromGameSituation<EntityClass extends Entity>(entityIds: EntityId[], gameSituation: GameSituation): EntityClass[] {
  const entities = [];
  for (let entityId of entityIds) {
    entities.push(gameSituation[entityId] as EntityClass);
  }

  return entities;
}

export { getEntityFromGameSituation, getEntitiesFromGameSituation }
