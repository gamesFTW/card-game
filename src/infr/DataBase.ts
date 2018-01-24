import * as fs from "fs";

import {Event} from "./Event";
import * as cardEvents from "../domain/card/CardEvents";

class DataBase {
  public cards: {[s: string]: Array<Event>} = {};

  public save() {
    let data = JSON.stringify({cards: this.cards});
    fs.writeFileSync('./db.json', data);
  }

  public load() {
    let dataBuffer;
    try {
      dataBuffer = fs.readFileSync('./db.json');
    } catch (error) {}

    let data: any = JSON.parse(String(dataBuffer));

    for (let aggregateKey in data) {
      (this as any)[aggregateKey] = this.loadAggregate(data[aggregateKey]);
    }
  }

  private loadAggregate(aggregate: any) {
    let aggregateToReturn: {[s: string]: Array<Event>} = {};
    for (let cardId in aggregate) {
      let cardEventsData = aggregate[cardId];

      let events = cardEventsData.map((cardEventData: any) => {
        let data = cardEventData.data;

        let cardEventClass: any = (cardEvents as any)[cardEventData.type];
        return new cardEventClass(data);
      });

      aggregateToReturn[cardId] = events;
    }

    return aggregateToReturn;
  }
}

let db: DataBase = new DataBase();
db.load();

export {db};
