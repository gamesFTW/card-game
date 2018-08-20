import { promisify } from 'util';
import { join } from 'path';
import { readFile as _readFile } from 'fs';

import * as Router from 'koa-router';

const readFile = promisify(_readFile);
const staticContorller = new Router();

staticContorller.get('/', async (ctx) => {
  // Temporary data
  
  ctx.body = await readFile(join(process.cwd(), 'client', 'index.html'), 'utf-8');
});

export {staticContorller};
