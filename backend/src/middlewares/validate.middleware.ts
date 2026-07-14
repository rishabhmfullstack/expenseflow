import { Request, RequestHandler } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type ValidationSchema = AnyZodObject | ZodEffects<AnyZodObject>;

interface ValidateOptions {
  body?: ValidationSchema;
  query?: ValidationSchema;
  params?: ValidationSchema;
}

export function validatedQuery<T>(req: Request): T {
  return req.validated?.query as T;
}

export function validatedParams<T>(req: Request): T {
  return req.validated?.params as T;
}

export function validatedBody<T>(req: Request): T {
  return (req.validated?.body ?? req.body) as T;
}

export function validate(schemas: ValidateOptions): RequestHandler {
  return (req, _res, next) => {
    try {
      req.validated ??= {};

      if (schemas.body) {
        req.validated.body = schemas.body.parse(req.body);
        req.body = req.validated.body;
      }

      if (schemas.query) {
        req.validated.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.validated.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
