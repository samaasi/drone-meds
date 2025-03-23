import { ZodError } from 'zod';
import ResponseUtility from '../utils/response';
import { Request, Response, NextFunction } from 'express';

/** NOT_FOUND_ERROR_HANDLER */
export class NotFoundError extends Error {
    statusCode = 404;
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

/** UNAUTHORIZED_ERROR_HANDLER */
export class UnauthorizedError extends Error {
    statusCode = 401;
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

/** VALIDATION_ERROR_HANDLER */
export class ValidationError extends Error {
    statusCode = 400;
    details: Array<{ path: string; message: string }>;

    constructor(zodError: ZodError) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.details = zodError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
        }));
    }
}

/** CENTRALIZED_ERROR_HANDLER */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof ValidationError) {
        return ResponseUtility.error(
            res,
            err.statusCode,
            err.message,
            { validationErrors: err.details }
        );
    }

    if (err instanceof ZodError) {
        const validationErrors = err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
        }));
        return ResponseUtility.error(
            res,
            400,
            'Validation error',
            { validationErrors }
        );
    }

    if (err instanceof NotFoundError || err instanceof UnauthorizedError) {
        return ResponseUtility.error(
            res,
            err.statusCode,
            err.message
        );
    }

    console.error('🚨 Unexpected error:', err.stack);

    ResponseUtility.error(
        res,
        500,
        'Internal server error',
        process.env.NODE_ENV === 'development'
            ? { stack: err.stack }
            : undefined
    );
};

export const asyncHandler = (fn: Function) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch((error) => {
            if (error instanceof ZodError) {
                next(new ValidationError(error));
            } else {
                next(error);
            }
        });