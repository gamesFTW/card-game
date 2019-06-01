import { Entity } from '../../infr/Entity';

import { Event } from '../../infr/Event';
import { AreaData, AreaState, AreaType } from './AreaState';
import { AreaEventType } from '../events';
import { CardData } from '../card/CardState';

interface AreaCreationData {
  type: AreaType;
}

class Area extends Entity {
  get canUnitsWalkThoughtIt (): boolean { return this.state.canUnitsWalkThoughtIt; }
  get canUnitsShootThoughtIt (): boolean { return this.state.canUnitsShootThoughtIt; }

  protected state: AreaState;

  constructor (events: Array<Event<CardData>> = []) {
    super();
    this.state = new AreaState(events);
  }

  public create (areaCreationData: AreaCreationData): void {
    let id = this.generateId();

    let data: AreaData = {id, type: areaCreationData.type};

    if (areaCreationData.type === AreaType.LAKE) {
      data.canUnitsWalkThoughtIt = false;
      data.canUnitsShootThoughtIt = true;
    }
    if (areaCreationData.type === AreaType.MOUNTAIN) {
      data.canUnitsWalkThoughtIt = false;
      data.canUnitsShootThoughtIt = false;
    }
    if (areaCreationData.type === AreaType.WIND_WALL) {
      data.canUnitsWalkThoughtIt = true;
      data.canUnitsShootThoughtIt = false;
    }

    this.applyEvent(new Event<AreaData>(
      AreaEventType.AREA_CREATED, {...data}
    ));
  }
}

export {Area, AreaCreationData};
