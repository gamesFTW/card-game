import { ObjectId } from 'mongodb';

type EntityType = string;
type EntityId = string;
type EventId = string;
type UseCaseId = number;

export interface Game {
    _id: ObjectId;
    type: string;
    date: string;
    gameServerId: string;
    started: boolean;
    deckId1: string | null;
    deckId2: string | null;
    deckId3: string | null;
    deckId4: string | null;

    // useCases: Record<UseCaseId, UseCaseData>;
    entities: Record<EntityType, Record<EntityId, Record<EventId, EventData>>>;
}

export type UseCaseData = {
    type: string;
    events: Record<EntityType, Record<EntityId, EventId>>;
}

export type EventData = {
    type: string;
    data?: any;
    extra?: any;
};
