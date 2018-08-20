import * as Koa from 'koa';
import * as socketIO from 'socket.io';

type SocketOptions = {
  namespace?: String,
  hidden: Boolean,
  ioOptions: {
    [option: string]: any
  }
};

type eventName = 'connect' | 'event' | 'message' | 'open' | 'close' | 'register' | 'disconnect';
type room = String;

type eventCtx = {
  event: String,
  data: any,
  socket: socketIO.Socket,
  acknowledge: Function 
};

interface eventCb { (ctx: eventCtx, data: any): void }
interface useCb { (ctx: eventCtx, next: () => Promise<void>): void }

declare class IO {
  socket: socketIO.Server;
  constructor (opts?: String|SocketOptions);
  on (event: eventName, handler: eventCb): this;
  off (event: eventName, handler: eventCb): this;
  to (room: room): socketIO.Socket;
  broadcast (event: eventName, data: any): void;
  attach (app: Koa, https: Boolean): void ;
  use (cb: useCb): void;
}

declare module IO {}
export = IO;
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