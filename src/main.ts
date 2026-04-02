import 'reflect-metadata';

import cors from '@koa/cors';
import Koa, { DefaultState } from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from "koa-static";
import { InjectionToken, Provider, container } from 'tsyringe';

import { ILaochanContext } from './types.js';
import { DefaultService } from './controllers/default.js';
import { Logger } from '@cordisjs/logger';
import { eacnet } from './middlewares/eacnet.js';
import config from './utils/config.js';
import { Db } from 'mongodb';
import { apiRoutes } from './apis/index.js';
import { initMongoDb } from './database.js';

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

  container.register(Db, {
    useValue: await initMongoDb(),
  });

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
    .use(cors())
    .use(bodyParser({
      formLimit: '1mb',
    }))
    .use(eacnet)
    .use(async (ctx, next) => {
      ctx.logger = ctx.service
        ? register(`logger:${ctx.service.name}:${ctx.service.module ? ctx.service.module + ':' : '' }${ctx.service.method}`, {
          useValue: new Logger(`${ctx.service.name}:${ctx.service.module ? ctx.service.module + ':' : '' }${ctx.service.method}`),
        })
        : logger;

      if (!ctx.service) {
        return await next();
      }

      let service: object | undefined = tryResolve(ctx.service.name);

      if (service === undefined) {
        try {
          let module: any = null;

          try {
            module = await import(
              `./controllers/${ctx.service.name}/index.js`
            );
          } catch (e) {
            if (e.code != 'ERR_MODULE_NOT_FOUND') {
              ctx.logger.error(
                `load service error %s`,
                JSON.stringify(e, Object.getOwnPropertyNames(e), 2),
              );
            } else {
              module = await import(
                `./controllers/${ctx.service.name}.js`
              );
            }
          }

          service = register(ctx.service.name, {
            useClass: module.default,
          });
        } catch (e) {
          if (e.code != 'ERR_MODULE_NOT_FOUND') {
            ctx.logger.error(
              `load controller error %s`,
              JSON.stringify(e, Object.getOwnPropertyNames(e), 2),
            );
          }
        }
      }

      ctx.logger.info(
        '%s [%s]: request = %s',
        ctx.url,
        ctx.token,
        JSON.stringify(ctx.body, (key, value) => {
          if (key === 'pdata') {
            return '<PDATA>';
          } else if (key == 'item') {
            return '<ITEM>';
          } else if (key == 'param') {
            return '<PARAM>';
          } else if (typeof value === 'bigint') {
            return value.toString();
          }

          return value;
        }),
      );

      let method = ctx.service.method;

      if (!service) {
        ctx.logger.warn(`unimplemented service ${ctx.service.name}.`);

        service = container.resolve(DefaultService);
        method = 'default';
      } else {
        if (!(service[method])?.bind) {
          method = ctx.service.module + '_' + ctx.service.method;

          if (!(service[method])?.bind) {
            ctx.logger.warn(`unimplemented method ${JSON.stringify(ctx.service)}.`);

            service = container.resolve(DefaultService);
            method = 'default';
          }
        }
      }

      ctx.body = await (service[method] as Function).bind(service)(ctx);
      ctx.status = 200;

      ctx.logger.info('[server]: status = %d', ctx.status);
    })
    .use(async (ctx, next) => {
      let matchApi = true;
      await apiRoutes(ctx as any, async () => {
        matchApi = false;
      });

      if (matchApi) {
        ctx.body = JSON.stringify(ctx.body, (_, v) => {
          if (typeof v === 'bigint') {
            return v.toString();
          }

          return v;
        });
        ctx.set('Content-Type', 'application/json');
        return;
      }

      await next();
    })
    .use(serve('static'))
    .use(async (ctx, next) => {
      if (!ctx.body) {
        ctx.body = 'Laochan-Eacnet is running.';
      }

      return next();
    });

  app.context.resolve = container.resolve.bind(container);

  logger.info('listening on %d', config.port);
  app.listen(config.port);
}

main();
