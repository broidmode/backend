import { Logger } from "@cordisjs/logger";
import { MongoClient } from "mongodb";
import config from "./utils/config.js";
import { PlayerPlayData } from "./types/index.js";
import { fromKBinXml } from "./utils/kbinxml.js";
import { Pdata } from "./types/pdata.js";

interface DatabaseMeta {
  version: number;
}

export async function initMongoDb() {
  const logger = new Logger('database');

  logger.info('connecting to mongodb...');
  const client = await MongoClient.connect(config.mongoUrl);
  const db = client.db(config.dbName);
  const metaCol = db.collection<DatabaseMeta>('__metadata');
  let meta: DatabaseMeta = await metaCol.findOne({});
  meta ??= { version: 0 };

  // version 1: add infas id and djname to playdata collection
  if (meta.version < 1) {
    logger.info('upgrading database to ver 1');
    const playDataCol = db.collection<PlayerPlayData>('player_play_data');

    const cursor = playDataCol.find({});
    const tasks = [];
    for await (const player of cursor) {
      const { pdata } = fromKBinXml(player.pdata.buffer) as { pdata: Pdata };

      tasks.push(playDataCol.updateOne({ _id: player._id }, {
        $set: {
          djname: pdata.player.djname,
          infinitas_id: pdata.player.infinitas_id,
        }
      }));
    }

    await Promise.all(tasks);

    logger.info('upgraded database to ver 1, effected %d', tasks.length);
    meta.version = 1;
  }

  await metaCol.updateOne({}, { $set: meta }, { upsert: true });
  return db;
}
