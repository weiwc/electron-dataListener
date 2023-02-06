import path from 'path';
import { app } from 'electron';

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(
  path.join(app.getPath('userData'), 'datastore.json')
);
const db = low(adapter);

export default db;
