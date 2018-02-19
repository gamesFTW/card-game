import * as fs from "fs";

import { Event } from "./Event";
import * as cardEvents from "../domain/card/CardEvents";
import * as fieldEvents from "../domain/field/FieldEvents";

class DataBase {
  public cards: {[s: string]: Array<Event>} = {};
  public field: Array<Event> = [];

  public save () {
    let data = JSON.stringify({cards: this.cards, field: this.field});
    fs.writeFileSync('./db.json', data);
  }

  public load () {
    let dataBuffer;
    try {
      dataBuffer = fs.readFileSync('./db.json');
    } catch (error) {
      console.error('no database found');
    }

    let data: any = JSON.parse(String(dataBuffer));

    this.cards = this.loadAggregates(data['cards'], cardEvents);
    this.field = this.loadAggregate(data['field'], fieldEvents);
  }

  private loadAggregate (aggregateEventsData: any, aggregateEvents: any): Array<Event> {
    let events = aggregateEventsData.map((eventData: any) => {
      let data = eventData.data;

      let aggregateEventClass: any = (aggregateEvents as any)[eventData.type];
      return new aggregateEventClass(data);
    });

    return events;
  }

  private loadAggregates (aggregate: any, aggregateEvents: any): {[s: string]: Array<Event>} {
    let aggregateToReturn: {[s: string]: Array<Event>} = {};
    for (let aggregateId in aggregate) {
      let aggregateEventsData = aggregate[aggregateId];

      let events = this.loadAggregate(aggregateEventsData, aggregateEvents);

      aggregateToReturn[aggregateId] = events;
    }

    return aggregateToReturn;
  }
}

let db: DataBase = new DataBase();
db.load();

export {db};
