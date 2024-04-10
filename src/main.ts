import 'reflect-metadata';

import Koa, { DefaultState } from 'koa';
import bodyParser from 'koa-bodyparser';
import { InjectionToken, Provider, container } from 'tsyringe';

import { ILaochanContext } from './types.js';
import { DefaultService } from './services/default.js';
import { Logger } from '@cordisjs/logger';
import { eacnet } from './middlewares/eacnet.js';
import config from './utils/config.js';
import { MongoClient, Db } from 'mongodb';

function tryResolve<T>(token: InjectionToken<T>): T | undefined {
  if (!container.isRegistered(token)) return undefined;

  return container.resolve(token);
}

function register<T>(
  token: InjectionToken<T>,
  provider: Provider<T> | { new(...args: any[]): T },
): T {
  if (container.isRegistered(token)) return container.resolve(token);

  // @ts-expect-error: noob tsc
  return container.register(token, provider).resolve(token);
}

async function main(): Promise<void> {
  const logger = new Logger('laochan-eacnet');

  logger.info('initialization...');

  {
    logger.info('connecting to mongodb...');
    const client = await MongoClient.connect(config.mongoUrl);

    container.register(Db, {
      useValue: client.db(config.dbName),
    });
  }

  logger.info('creating koa app...');

  const app = new Koa<DefaultState, ILaochanContext>()
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (e) {
        logger.error(
          'unexcepted error: %s',
          JSON.stringify(e, Object.getOwnPropertyNames(e), 2),
        );

        ctx.status = e.status ?? 500;
        ctx.body = `${e.stack ?? 'Internal Error'}`;
      }
    })
    .use(bodyParser({
      formLimit: '1mb',
    }))
    .use(eacnet)
    .use(async (ctx, next) => {
      if (!ctx.service) {
        throw new Error('invaild service');
      }

      ctx.logger = ctx.service
        ? register(`logger:${ctx.service.name}:${ctx.service.method}`, {
          useValue: new Logger(`${ctx.service.name}:${ctx.service.method}`),
        })
        : logger;

      let service: object | undefined = tryResolve(ctx.service.name);

      if (service === undefined) {
        try {
          let module: any = null;

          try {
            module = await import(
              `./services/${ctx.service.name}/index.js`
            );
          } catch (e) {
            if (e.code != 'ERR_MODULE_NOT_FOUND') {
              logger.error(
                `load service error %s`,
                JSON.stringify(e, Object.getOwnPropertyNames(e), 2),
              );
            } else {
              module = await import(
                `./services/${ctx.service.name}.js`
              );
            }
          }

          service = register(ctx.service.name, {
            useClass: module.default,
          });
        } catch (e) {
          if (e.code != 'ERR_MODULE_NOT_FOUND') {
            logger.error(
              `load service error %s`,
              JSON.stringify(e, Object.getOwnPropertyNames(e), 2),
            );
          }
        }
      }

      logger.info(
        '%s %s.%s [%s]: request = %s',
        ctx.url,
        ctx.service.name,
        ctx.service.method,
        ctx.token,
        JSON.stringify(ctx.body, (key, value) => {
          if (key === 'pdata') {
            return '<PDATA>';
          }

          return value;
        }),
      );

      let method = ctx.service.method;

      if (!service || !(service[method])?.bind) {
        logger.warn(`unimplemented method ${method} in ${ctx.service.name}`);

        service = container.resolve(DefaultService);
        method = 'default';
      }

      ctx.body = await (service[method] as Function).bind(service)(ctx);
      ctx.status = 200;

      logger.info('%s.%s [server]: status = %d', ctx.service.name, ctx.service.method, ctx.status);
      return await next();
    });

  logger.info('listening on %d', config.port);
  app.listen(config.port);
}

main();
