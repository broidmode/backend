import Router from "@koa/router";
import { p2dRoutes } from "./p2d/index.js";
import { DefaultContext, DefaultState, ParameterizedContext } from "koa";
import { ILaochanContext } from "../types.js";

const router = new Router({
  prefix: '/api',
})
  .use(p2dRoutes);

export const apiRoutes = router.routes();
export type Context = ParameterizedContext<DefaultState, ILaochanContext & Router.RouterParamContext<DefaultState, DefaultContext>, any>;

