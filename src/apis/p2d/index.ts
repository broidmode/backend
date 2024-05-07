import { Logger } from "@cordisjs/logger";
import Router from "@koa/router";
import { Context } from "../index.js";
import { UserService } from "../../services/p2d/user.js";
import { PlayerCustomizeSetting, PlayerRivalData } from "../../types/p2d/index.js";
import { RivalPatch, RivalPostOrDelete } from "../../types/p2d/api.js";
import { toLower } from "lodash";

const logger = new Logger('p2d-api');
const router = new Router({
  prefix: '/p2d',
})

  .get('/bot/player/:infinitas_id', async (ctx: Context) => {
    const { infinitas_id } = ctx.params;

    if (!infinitas_id) {
      ctx.status = 400;
      return;
    }

    const player = await ctx.resolve(UserService).findPlayerByInfasId(infinitas_id);

    if (!player) {
      ctx.status = 404;
    }

    ctx.body = {
      found: !!player,
      player,
    };
  })

  .get('/pdata/:token', async (ctx: Context) => {
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    logger.info('request pdata %s', token);
    const pdata = await ctx.resolve(UserService).getPDataDecoded(token);

    ctx.status = pdata ? 200 : 404;
    ctx.body = pdata ? { pdata } : {};
  })

  .get('/customize/:token', async (ctx: Context) => {
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    logger.info('request customize %s', token);
    const customize = await ctx.resolve(UserService).getCustomizeSetting(token);

    ctx.status = 200;
    ctx.body = {
      customize,
    };
  })

  .get('/playlog/:token', async (ctx: Context) => {
    let { skip, limit } = ctx.query;
    const { token } = ctx.params;

    if (skip instanceof Array) {
      [skip] = skip;
    }

    if (limit instanceof Array) {
      [limit] = limit;
    }

    const result = await ctx.resolve(UserService)
      .getPlayLogs(token, skip ? parseInt(skip) : undefined, limit ? parseInt(limit) : undefined);

    ctx.status = 200;
    ctx.body = {
      playLogs: result,
    };
  })

  .get('/rival/:token', async (ctx: Context) => {
    const { token } = ctx.params;
    const result = await ctx.resolve(UserService)
      .getPlayerRivalData(token);

    if (!result.enabled) {
      ctx.status = 200;
      ctx.body = {
        enabled: false,
        spRivals: [],
        dpRivals: [],
      };

      return;
    }

    const getRivalPlayer = async (tk: string) => {
      const pdata = await ctx.resolve(UserService)
        .getPDataDecoded(tk);

      return pdata.player;
    };

    const [spRivals, dpRivals] = await Promise.all([
      await Promise.all(result.sp.map(getRivalPlayer)),
      await Promise.all(result.dp.map(getRivalPlayer)),
    ]);

    ctx.status = 200;
    ctx.body = {
      enabled: true,
      spRivals, dpRivals,
    };
  })

  .patch('/rival/:token', async (ctx: Context) => {
    const { token } = ctx.params;
    const { enabled } = ctx.request.body as RivalPatch;

    await ctx.resolve(UserService)
      .upsertPlayerRivalData({
        _id: token,
        enabled,
      } as PlayerRivalData);

    ctx.status = 200;
    ctx.body = {
      success: true,
    };
  })

  .post('/rival/:token', async (ctx: Context) => {
    const { token } = ctx.params;
    const { infinitas_id, type } = ctx.request.body as RivalPostOrDelete;

    if (!infinitas_id) {
      ctx.status = 400;
      ctx.body = { error: 'infinitas_id is undefined' };
      return;
    }

    const [existing, { player: target }] = await Promise.all([
      ctx.resolve(UserService).getPlayerRivalData(token),
      ctx.resolve(UserService).findPlayerByInfasId(infinitas_id),
    ]);

    if (!target) {
      ctx.status = 404;
      ctx.body = { error: 'rival target not found' };
      return;
    }

    if (target == token) {
      ctx.status = 400;
      ctx.body = { error: 'ni rival ni zi ji?' };
      return;
    }

    const targetArray = type ? existing.dp : existing.sp;
    if (targetArray.includes(target)) {
      ctx.status = 400;
      ctx.body = { error: 'rival target already exists' };
      return;
    }

    targetArray.push(target);

    await ctx.resolve(UserService)
      .upsertPlayerRivalData(existing);

    ctx.status = 200;
    ctx.body = {
      success: true,
    };
  })

  .delete('/rival/:token', async (ctx: Context) => {
    const { token } = ctx.params;
    const { infinitas_id, type } = ctx.request.body as RivalPostOrDelete;

    const [existing, { player: target }] = await Promise.all([
      ctx.resolve(UserService).getPlayerRivalData(token),
      ctx.resolve(UserService).findPlayerByInfasId(infinitas_id),
    ]);

    if (type) {
      existing.dp = existing.dp.filter(v => v != target)
    } else {
      existing.sp = existing.sp.filter(v => v != target)
    }

    await ctx.resolve(UserService)
      .upsertPlayerRivalData(existing);

    ctx.status = 200;
    ctx.body = {
      success: true,
    };
  })

  .put('/customize/:token', async (ctx: Context) => {
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    logger.info('set customize %s', token);
    const customize = ctx.request.body as PlayerCustomizeSetting;

    if (!customize) {
      ctx.status = 400;
      return;
    }

    customize._id = token;
    await ctx.resolve(UserService).upsertCustomizeSetting(customize);

    ctx.status = 200;
    ctx.body = { success: true };
  });


export const p2dRoutes = router.routes();
