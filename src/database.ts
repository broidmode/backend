import { Logger } from "@cordisjs/logger";
import { MongoClient } from "mongodb";
import config from "./utils/config.js";
import { PlayerPlayData } from "./types/p2d/index.js";
import { fromKBinXml, toObject } from "./utils/kbinxml.js";
import { Pdata } from "./types/p2d/pdata.js";

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
      const { pdata } = toObject(fromKBinXml(player.pdata.buffer)) as { pdata: Pdata };

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

  if (meta.version < 2) {
    const collections = await db.listCollections().toArray();
    const tryRenameCollection = async (src: string, dest: string) => {
      if (!collections.some(v => v.name === src)) {
        return;
      }

      const col = db.collection(src);
      await col.rename(dest);
    };

    await Promise.all([
      tryRenameCollection('player_play_data', 'p2d_play_data'),
      tryRenameCollection('player_music_data', 'p2d_music_data'),
      tryRenameCollection('player_play_log', 'p2d_play_log'),
      tryRenameCollection('player_course_log', 'p2d_course_log'),
      tryRenameCollection('player_customize_setting', 'p2d_customize_setting'),
      tryRenameCollection('player_rival_data', 'p2d_rival_data'),
    ])

    logger.info('upgraded database to ver 2, renamed prefix player to p2d.');
    meta.version = 2;
  }

  await metaCol.updateOne({}, { $set: meta }, { upsert: true });
  return db;
}
