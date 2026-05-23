import Router from "@koa/router";
import { p2dRoutes } from "./p2d/index.js";
import { DefaultContext, DefaultState, ParameterizedContext } from "koa";
import { ILaochanContext } from "../types.js";
import { sdvxRoutes } from './sdvx/index.js';
import { ddrRoutes } from './ddr/index.js';

const router = new Router({
  prefix: '/api',
})
  .use(p2dRoutes)
  .use(sdvxRoutes)
  .use(ddrRoutes);

export const apiRoutes = router.routes();
export type Context = ParameterizedContext<DefaultState, ILaochanContext & Router.RouterParamContext<DefaultState, DefaultContext>, any>;

