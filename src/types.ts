import { Logger } from '@cordisjs/logger';
import { DefaultState, ParameterizedContext } from 'koa';

export interface ILaochanContext {
  token?: string;

  service: {
    name: string,
    method: string,
  };

  logger: Logger;
  body?: unknown;
}

export type Context = ParameterizedContext<DefaultState, ILaochanContext, any>;
