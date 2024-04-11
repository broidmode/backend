import { Logger } from '@cordisjs/logger';
import { DefaultState, ParameterizedContext } from 'koa';
import { InjectionToken } from 'tsyringe';

export interface ILaochanContext {
  token?: string;

  service: {
    name: string,
    method: string,
  };

  logger: Logger;
  body?: unknown;
  resolve: <T>(resolveToken: InjectionToken<T>) => T;
}

export type Context = ParameterizedContext<DefaultState, ILaochanContext, any>;
