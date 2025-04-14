import { Logger } from '@cordisjs/logger';
import { DefaultState, ParameterizedContext } from 'koa';
import { InjectionToken } from 'tsyringe';
import { Serializable } from './utils/kxml-value.js';

export interface AcRelayInfo {
  module: string;
  method: string;
  request: Serializable;
}

export interface ILaochanContext {
  token?: string;

  service: {
    name: string,
    module: string,
    method: string,
  };

  acRelayInfo?: AcRelayInfo;

  logger: Logger;
  body?: unknown;
  resolve: <T>(resolveToken: InjectionToken<T>) => T;
}

export type Context = ParameterizedContext<DefaultState, ILaochanContext, any>;
