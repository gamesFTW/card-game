/// <reference types="node" />

declare function eventstore(options: eventstore.EventStoreOptions): eventstore.EventStore;

declare namespace eventstore {
  class EventStore {
    init (cb?: initCallback): void;

    on (eventType: 'connect' | 'disconnect' | 'error', cb: callback): void;

    getEvents (id: {aggregateId?: string, aggregate?: string}): void;

    getEventStream (id: streamId, cb: streamCallback): void;
    getEventStream (id: {aggregateId: string, aggregate: string}): void;

    getFromSnapshot(id: streamId, cb: snapshotCallback): void;
  }

  type streamId = String;
  type EventStoreOptions = { [s: string]: any };

  interface Stream {
    addEvent(data: Data): void

    commit(cb: streamCallback): void

    events: [Event]
    eventsToDispatch?: [Event]
  }

  interface Snapshot {
    data: Data
    events: [Event]

  }

  type Data = { [s: string]: any };

  type Event = {
    _id: hash
    streamId: streamId
    aggregateId: String
    aggregate: String | null
    context: String | null
    streamRevision: Number
    commitId: hash
    commitSequence: Number
    commitStamp: Date
    payload: Data
    id: hash
    restInCommitStream: Number
    dispatched: Boolean
  };

  type callback = () => void;
  type initCallback = (err: Error) => void;
  type streamCallback = (err: Error, stream: Stream) => void;
  type snapshotCallback = (err: Error, snapshot: Snapshot, stream: Stream) => void;
  type Error = Object;
  type hash = String;
}

export = eventstore;

// declare module 'dir-obj' {
//     import { Stats } from "fs";

//     export interface readOptions {
//       filter?: RegExp | Filter,
//       dirTransform?: DirTransform,
//       fileTransform?: FileTransform
//     }

//     export type Filter = (file: File) => boolean;
//     export type DirTransform = (file: File, value: any) => any;
//     export type FileTransform = (file: File) => any;

//     export function readDirectory(dir: string, options?: readOptions): object;

//     export class File {
//       key: string;
//       readonly path: string;
//       readonly fullpath: string;
//       readonly ext: string;
//       readonly name: string;
//       readonly basename: string;

//       constructor(dir: string, file: string);

//       readonly attributes: Stats;
//       readonly isDirectory: boolean;
//       readonly isRequirable: boolean;
//     }
//   }