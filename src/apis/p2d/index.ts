import { Logger } from "@cordisjs/logger";
import Router from "@koa/router";
import { Context } from "../index.js";
import { UserService } from "../../services/p2d/user.js";
import { PlayerCustomizeSetting } from "../../database/index.js";

const logger = new Logger('p2d-api');
const router = new Router({
  prefix: '/p2d',
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
    ctx.body = pdata ? pdata : {};
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
