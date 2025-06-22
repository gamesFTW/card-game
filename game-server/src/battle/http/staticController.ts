import { promisify } from 'util';
import { join } from 'path';
import { readFile as _readFile } from 'fs';
import { ObjectId } from 'mongodb';

import { Router } from 'express';
import { LobbyRepository } from '../../lobby/LobbyRepository';
const readFile = promisify(_readFile);

class StaticContorller {
  public router: Router;
  private lobbyRepository: LobbyRepository;

  constructor(lobbyRepository: LobbyRepository) {
    this.lobbyRepository = lobbyRepository;
    this.router = Router();
    this.router.get('/', this.getIndex.bind(this));
    this.router.get('/image', this.getImage.bind(this));
    this.router.get('/sound', this.getSound.bind(this));
  }

  private async getIndex(_request, response) {
    const file = await readFile(join(process.cwd(), 'client', 'index.html'), 'utf-8');
    response.send(file);
  }

  public async getImage(request, response) {
    const filerecord = await this.lobbyRepository.imagesFilerecordCollection.findOne({ _id: request.query.imageId });
    const file = await this.lobbyRepository.imagesChunksCollection.findOne({ files_id: new ObjectId(filerecord.copies.Images.key) });

    response.set('Content-Type', 'image/png');
    response.send(file.data.buffer);
  }

  public async getSound(request, response) {
    const filerecord = await this.lobbyRepository.soundsFilerecordCollection.findOne({ _id: request.query.soundId });
    const file = await this.lobbyRepository.soundsChunksCollection.findOne({ files_id: new ObjectId(filerecord.copies.Sounds.key) });

    response.set('Content-Type', 'audio/wav');
    response.send(file.data.buffer);
  }
}

export { StaticContorller };
