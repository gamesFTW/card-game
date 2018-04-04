import { Card } from '../../domain/card/Card';
import { Event } from '../Event';
import { EntityId } from '../Entity';
import { eventStore } from '../eventStore';
import * as eventstore from 'eventstore';
import * as cardEvents from '../../domain/card/CardEvents';
import * as lodash from 'lodash';

class CardRepository {
  static async save (card: Card): Promise<void> {
    let stream = await eventStore.getEventStream({
      aggregateId: card.id,
      aggregate: Card.name
    });

    card.changes.forEach((event: Event) => {
      stream.addEvent(event);
    });

    await stream.commit();
  }

  static async get (id: EntityId): Promise<Card> {
    let stream = await eventStore.getEventStream({
      aggregateId: id,
      aggregate: Card.name
    });

    return CardRepository._createCardByEvents(stream.events);
  }

  static async getAll (): Promise<Array<Card>> {
    let events = await eventStore.getEvents({
      aggregate: Card.name
    });

    let groupedEvents = lodash.groupBy(events, 'aggregateId');

    let sortedGroupedEvents = lodash.map(groupedEvents, (events) => {
      return lodash.sortBy(events,'commitStamp');
    });

    return lodash.reduce(sortedGroupedEvents, (result, events: Array<eventstore.Event>) => {
      result.push(CardRepository._createCardByEvents(events));
      return result;
    }, []);
  }

  private static _createCardByEvents (streamEvents: Array <eventstore.Event>) {
    let events: Array<Event> = streamEvents.map((event: eventstore.Event) => {
      let payload = event.payload;

      let aggregateEventClass: any = (cardEvents as any)[payload.type];
      return new aggregateEventClass(payload.data);
    });

    return new Card(events);
  }
}

export {CardRepository};
