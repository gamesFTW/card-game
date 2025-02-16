import { promisify } from 'util';
import { join } from 'path';
import { readFile as _readFile } from 'fs';
import { ObjectId } from 'mongodb';

import * as Router from 'koa-router';
import { LobbyRepository } from '../lobby/LobbyRepository';
const readFile = promisify(_readFile);

class StaticContorller {
  public router: Router;
  private lobbyRepository: LobbyRepository;

  constructor(lobbyRepository: LobbyRepository) {
    this.lobbyRepository = lobbyRepository;
    this.router = new Router();
    this.router.get('/', this.getIndex.bind(this));
    this.router.get('/image', this.getImage.bind(this));
    this.router.get('/sound', this.getSound.bind(this));
  }

  private async getIndex(ctx: Router.IRouterContext) {
    ctx.body = await readFile(join(process.cwd(), 'client', 'index.html'), 'utf-8');
  }

  public async getImage(ctx: Router.IRouterContext) {
    const filerecord = await this.lobbyRepository.imagesFilerecordCollection.findOne({ _id: ctx.query.imageId });
    const file = await this.lobbyRepository.imagesChunksCollection.findOne({ files_id: new ObjectId(filerecord.copies.Images.key) });

    ctx.type = 'image/png';
    ctx.body = file.data.buffer;
  }

  public async getSound(ctx: Router.IRouterContext) {
    const filerecord = await this.lobbyRepository.soundsFilerecordCollection.findOne({ _id: ctx.query.soundId });
    const file = await this.lobbyRepository.soundsChunksCollection.findOne({ files_id: new ObjectId(filerecord.copies.Sounds.key) });

    ctx.type = 'audio/wav';
    ctx.body = file.data.buffer;
  }
}

export { StaticContorller };
