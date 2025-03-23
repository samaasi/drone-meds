import { Response } from 'express';

type ResponseData<T> = {
    status: 'success' | 'fail' | 'error';
    message?: string;
    data?: T;
    error?: {
        code?: number;
        message?: string;
        details?: unknown;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
    };
};

class ResponseUtility {
    static created<T>(res: Response, data: T, statusCode = 201, message?: string): void {
        const response: ResponseData<T> = {
            status: 'success',
            message,
            data
        };

        res.status(statusCode).json(response);
    }

    static success<T>(res: Response, data: T, statusCode = 200, message?: string): void {
        const response: ResponseData<T> = {
            status: 'success',
            message,
            data
        };

        res.status(statusCode).json(response);
    }

    static error(res: Response, statusCode: number, message: string, errorDetails?: unknown): void {
        const response: ResponseData<never> = {
            status: 'error',
            error: {
                code: statusCode,
                message,
                details: errorDetails
            }
        };

        res.status(statusCode).json(response);
    }

    static validationError(res: Response, errors: { path: string; message: string }[]): void {
        const response: ResponseData<never> = {
            status: 'fail',
            error: {
                code: 400,
                message: 'Validation error',
                details: errors
            }
        };

        res.status(400).json(response);
    }

    static paginated<T>(
        res: Response,
        data: T,
        meta: { page: number; limit: number; total: number },
        message?: string
    ): void {
        const response: ResponseData<T> = {
            status: 'success',
            message,
            data,
            meta
        };

        res.status(200).json(response);
    }

    static empty(res: Response): void {
        res.status(204).end();
    }
}

export default ResponseUtility;