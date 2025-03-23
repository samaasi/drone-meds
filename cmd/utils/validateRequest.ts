import ResponseUtility from "./response";
import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            validatedData?: {
                body?: unknown;
                query?: unknown;
                params?: unknown;
            };
        }
    }
}

export interface ValidationSchemas {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}


export const validateRequest = (schemas: ValidationSchemas) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validationResult = {
                body: {} as unknown,
                query: {} as unknown,
                params: {} as unknown,
            };

            if (schemas.body) {
                validationResult.body = await schemas.body.parseAsync(req.body);
            }

            if (schemas.query) {
                validationResult.query = await schemas.query.parseAsync(req.query);
            }

            if (schemas.params) {
                validationResult.params = await schemas.params.parseAsync(req.params);
            }

            req.validatedData = validationResult;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));

                ResponseUtility.validationError(res, errors);
            } else {
                next(error);
            }
        }
    };
};